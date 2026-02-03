import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DocumentItem } from "@/lib/data";

export function DocCard({ doc }: { doc: DocumentItem }) {
  const isGoogleForm = doc.fileType === "FORM";
  
  return (
    <Card className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">{doc.title}</h3>
          <Badge variant="outline">{doc.fileType}</Badge>
        </div>
        {doc.description ? (
          <p className="mt-2 text-sm text-muted-foreground">{doc.description}</p>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {isGoogleForm ? (
          <Button asChild size="sm">
            <Link href={doc.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open Form
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={doc.url} target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" />
                Open
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={doc.url} download>
                <Download className="h-4 w-4" />
                Download
              </Link>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
