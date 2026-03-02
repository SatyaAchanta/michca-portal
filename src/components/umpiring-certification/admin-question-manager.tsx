"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
  isActive: boolean;
  options: QuestionOption[];
  createdAtIso: string;
};

type QuestionDraft = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

const INITIAL_DRAFT: QuestionDraft = {
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

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
  return (
    <div className="space-y-3">
      <Input
        value={value.prompt}
        onChange={(event) => onChange({ ...value, prompt: event.target.value })}
        placeholder="Question prompt"
      />
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
        Tap number button to mark the correct answer option.
      </p>
      <Button type="button" className="min-h-11" disabled={isPending} onClick={onSubmit}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
