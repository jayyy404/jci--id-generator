import type { Delegate } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface RegistrationDetailsProps {
  delegate: Delegate;
  onConfirm: () => void;
  onBack: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p style={{ margin: "6px 0", fontSize: 14 }}>
      <strong style={{ color: "var(--navy)" }}>{label}:</strong>{" "}
      <span style={{ color: "var(--slate-600)" }}>{value}</span>
    </p>
  );
}

export function RegistrationDetails({ delegate, onConfirm, onBack }: RegistrationDetailsProps) {
  const fullName = `${delegate.firstName} ${delegate.lastName}`;

  if (delegate.kitConfirmed) {
    return (
      <Card>
        <h2>Already Confirmed</h2>
        <p style={{ color: "var(--slate-600)" }}>
          {fullName} ({delegate.chapterName}) has already confirmed their registration and kit
          receipt. If this isn&apos;t you, go back and search again.
        </p>
        <Button variant="secondary" onClick={onBack}>
          Search again
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 10 }}>Registration Details</h2>
  
      <p style={{ color: "var(--slate-600)", margin: "0 0 20px", lineHeight: 1.4 }}>
        If you notice any discrepancies, kindly proceed to the Secretariat before confirming your
        registration.
      </p>

      <Card style={{ textAlign: "center" }}>
        {delegate.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={delegate.photoUrl}
            alt={fullName}
            width={96}
            height={96}
            style={{
              objectFit: "cover",
              borderRadius: "50%",
              border: "3px solid var(--gold)",
            }}
          />
        ) : null}
        <h3 style={{ marginTop: 14 }}>{fullName}</h3>
        {delegate.preferredName ? (
          <p style={{ margin: "2px 0 8px", color: "var(--slate-600)" }}>&quot;{delegate.preferredName}&quot;</p>
        ) : null}

        <div style={{ textAlign: "left", marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <Field label="Chapter" value={delegate.chapterName} />
          <Field label="Phone Number" value={delegate.phoneNumber} />
          <Field label="T-Shirt Size" value={delegate.tshirtSize} />
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Button onClick={onConfirm}>Confirm Registration</Button>
        <Button variant="ghost" onClick={onBack}>
          Not me, go back
        </Button>
      </div>
    </div>
  );
}
