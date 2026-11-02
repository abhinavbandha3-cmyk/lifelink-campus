"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BloodPill } from "./blood-pill";
import { addContactRequest, donorShortName } from "@/lib/api";
import { useDemoStore } from "@/lib/demo-store";
import type { DonorMatch } from "@/lib/api";

export function ContactRequestDialog({
  donor,
  open,
  onOpenChange,
  onSent,
}: {
  donor: DonorMatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (donorId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {donor && (
          <RequestForm
            donor={donor}
            onOpenChange={onOpenChange}
            onSent={onSent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Mounted fresh every time the dialog opens, so fields always start empty. */
function RequestForm({
  donor,
  onOpenChange,
  onSent,
}: {
  donor: DonorMatch;
  onOpenChange: (open: boolean) => void;
  onSent: (donorId: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const complete = useDemoStore((s) => s.complete);

  const submit = () => {
    const nextErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) nextErrors.name = "Please tell the donor who is requesting.";
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      nextErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addContactRequest({
      donorId: donor.id,
      requestId: null,
      requesterName: name.trim(),
      requesterPhone: phone.trim(),
      note: note.trim() || "No extra details provided.",
    });
    complete("request_contact");
    toast.success(`Request sent to ${donorShortName(donor)}`, {
      description:
        "They will see it on their dashboard. Your contact is revealed to them only if they accept.",
    });
    onSent(donor.id);
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BloodPill group={donor.bloodGroup} size="sm" />
          Contact {donorShortName(donor)}?
        </DialogTitle>
        <DialogDescription>
          The donor sees your request on their dashboard. Their real phone
          number stays masked until they accept your request.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="cr-name">Your name</Label>
          <Input
            id="cr-name"
            placeholder="e.g. Ramesh Iyer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="text-xs font-medium text-destructive">{errors.name}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cr-phone">Your phone</Label>
          <Input
            id="cr-phone"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))
            }
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && (
            <p className="text-xs font-medium text-destructive">{errors.phone}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cr-note">Short note (optional)</Label>
          <Textarea
            id="cr-note"
            rows={2}
            placeholder="e.g. Father needs one unit at Kanta Hospital tomorrow morning."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={submit}>
          Send request
        </Button>
      </DialogFooter>
    </>
  );
}
