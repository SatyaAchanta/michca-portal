"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createCertificationQuestion,
  deleteCertificationQuestion,
  setCertificationQuestionActive,
  updateCertificationQuestion,
} from "@/app/admin/certification-questions/actions";

type QuestionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  sortOrder: number;
};

type Question = {
  id: string;
  prompt: string;
  imageUrl: string | null;
  isActive: boolean;
  options: QuestionOption[];
  createdAtIso: string;
};

type QuestionDraft = {
  prompt: string;
  options: string[];
  correctIndex: number;
  imageUrl: string | null;
};

const INITIAL_DRAFT: QuestionDraft = {
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  imageUrl: null,
};

async function uploadCertificationQuestionImage(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/certification-question-image", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Image upload failed.");
  }

  return payload.url;
}

function QuestionForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  isPending,
}: {
  value: QuestionDraft;
  onChange: (next: QuestionDraft) => void;
  onSubmit: () => void;
  submitLabel: string;
  isPending: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  const handleFileChange = (file: File | null) => {
    if (!file) {
      return;
    }

    setUploadMessage(null);
    startUploadTransition(async () => {
      try {
        const imageUrl = await uploadCertificationQuestionImage(file);
        onChange({ ...value, imageUrl });
        setUploadMessage("Image uploaded.");
      } catch (error) {
        setUploadMessage((error as Error).message);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <Input
        value={value.prompt}
        onChange={(event) => onChange({ ...value, prompt: event.target.value })}
        placeholder="Question prompt"
      />

      <div className="space-y-3 rounded-lg border border-dashed border-border/70 p-3">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4" />
          <p className="text-sm font-medium">Optional question image</p>
        </div>
        {value.imageUrl ? (
          <div className="space-y-3">
            <div className="relative h-64 w-full overflow-hidden rounded-md border">
              <Image
                src={value.imageUrl}
                alt="Certification question"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => onChange({ ...value, imageUrl: null })}
              disabled={isUploading || isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Remove Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="min-h-11 file:mr-3 file:rounded-md file:border file:border-input file:px-3 file:py-2"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              disabled={isUploading || isPending}
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, WEBP. Maximum file size: 2MB.
            </p>
          </div>
        )}
        {uploadMessage ? (
          <p
            className={`text-sm ${
              uploadMessage === "Image uploaded." ? "text-green-700 dark:text-green-300" : "text-destructive"
            }`}
          >
            {uploadMessage}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        {value.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Button
              type="button"
              variant={value.correctIndex === index ? "default" : "outline"}
              className="min-h-11 min-w-11 px-0"
              onClick={() => onChange({ ...value, correctIndex: index })}
            >
              {index + 1}
            </Button>
            <Input
              value={option}
              onChange={(event) => {
                const options = [...value.options];
                options[index] = event.target.value;
                onChange({ ...value, options });
              }}
              placeholder={`Answer option ${index + 1}`}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Tap the number button to mark the correct answer option.
      </p>
      <Button type="button" className="min-h-11" disabled={isPending || isUploading} onClick={onSubmit}>
        {isPending || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {submitLabel}
      </Button>
    </div>
  );
}

export function AdminQuestionManager({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [createDraft, setCreateDraft] = useState<QuestionDraft>(INITIAL_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<QuestionDraft>(INITIAL_DRAFT);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const orderedQuestions = useMemo(
    () =>
      [...questions].sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      ),
    [questions]
  );

  const submitCreate = () => {
    startTransition(async () => {
      const result = await createCertificationQuestion(createDraft);
      setFeedback(result.message);
      if (result.status === "success") {
        setCreateDraft(INITIAL_DRAFT);
      }
      router.refresh();
    });
  };

  const submitUpdate = () => {
    if (!editingId) {
      return;
    }

    startTransition(async () => {
      const result = await updateCertificationQuestion(editingId, editingDraft);
      setFeedback(result.message);
      if (result.status === "success") {
        setEditingId(null);
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <p className="font-medium">Create Question</p>
        </div>
        <QuestionForm
          value={createDraft}
          onChange={setCreateDraft}
          onSubmit={submitCreate}
          submitLabel="Add Question"
          isPending={isPending}
        />
      </Card>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="space-y-3">
        {orderedQuestions.map((question) => {
          const isEditing = editingId === question.id;
          return (
            <Card key={question.id} className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="font-medium leading-7">{question.prompt}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={question.isActive ? "default" : "outline"}>
                      {question.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{question.imageUrl ? "Image attached" : "No image"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      setEditingId(question.id);
                      const correctIndex = question.options.findIndex((option) => option.isCorrect);
                      setEditingDraft({
                        prompt: question.prompt,
                        imageUrl: question.imageUrl,
                        options: question.options
                          .slice()
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((option) => option.label),
                        correctIndex: correctIndex >= 0 ? correctIndex : 0,
                      });
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() =>
                      startTransition(async () => {
                        const result = await deleteCertificationQuestion(question.id);
                        setFeedback(result.message);
                        router.refresh();
                      })
                    }
                    disabled={isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {question.imageUrl ? (
                <div className="relative h-72 w-full overflow-hidden rounded-md border">
                  <Image
                    src={question.imageUrl}
                    alt="Certification question"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                {question.options
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((option) => (
                    <div key={option.id} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={option.isCorrect} disabled aria-label="Correct answer marker" />
                      <span>{option.label}</span>
                    </div>
                  ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant={question.isActive ? "outline" : "default"}
                  className="min-h-11"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await setCertificationQuestionActive(question.id, !question.isActive);
                      setFeedback(result.message);
                      router.refresh();
                    })
                  }
                  disabled={isPending}
                >
                  {question.isActive ? "Set Inactive" : "Set Active"}
                </Button>
              </div>

              {isEditing ? (
                <Card className="space-y-3 p-4">
                  <p className="font-medium">Edit Question</p>
                  <QuestionForm
                    value={editingDraft}
                    onChange={setEditingDraft}
                    onSubmit={submitUpdate}
                    submitLabel="Save Changes"
                    isPending={isPending}
                  />
                  <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </Card>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
