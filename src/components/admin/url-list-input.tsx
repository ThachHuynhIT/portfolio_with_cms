"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import styles from "./url-list-input.module.scss";

// The RHF field value stays the same newline-separated string
// `lineSeparatedUrls` (project-schema.ts) already expects — this is a UI
// layer only, not a schema/transform change (see the design spec's §8.4).
export function UrlListInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const rows = value.split("\n");

  function updateRow(index: number, next: string) {
    const nextRows = [...rows];
    nextRows[index] = next;
    onChange(nextRows.join("\n"));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index).join("\n"));
  }

  function addRow() {
    onChange([...rows, ""].join("\n"));
  }

  return (
    <div className={styles.stack} id={id}>
      {rows.map((row, index) => (
        <div key={index} className={styles.row}>
          <Input
            value={row}
            onChange={(event) => updateRow(index, event.target.value)}
            placeholder="https://..."
            aria-label={`Gallery URL ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove gallery URL ${index + 1}`}
            onClick={() => removeRow(index)}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <PlusIcon aria-hidden="true" />
        Add URL
      </Button>
    </div>
  );
}
