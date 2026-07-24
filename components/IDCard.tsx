import { forwardRef } from "react";
import type { Delegate } from "@/lib/types";

interface IDCardProps {
  delegate: Delegate;
}

export const IDCard = forwardRef<HTMLDivElement, IDCardProps>(function IDCard(
  { delegate },
  ref,
) {
  const fullName = `${delegate.firstName} ${delegate.lastName}`;

  return (
    <div ref={ref} style={{ border: "1px solid #ccc", padding: 16, width: 320, textAlign: "center" }}>
      <p style={{ margin: 0, fontSize: 12, letterSpacing: 1 }}>DELEGATE</p>
      {delegate.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={delegate.photoUrl}
          alt={fullName}
          width={96}
          height={96}
          style={{ objectFit: "cover", margin: "12px auto 0", borderRadius: "50%" }}
        />
      ) : null}

      <h2 style={{ margin: "16px 0 0" }}>{fullName}</h2>

      {delegate.preferredName ? (
        <p style={{ margin: "8px 0 0" }}>{delegate.preferredName}</p>
      ) : null}

      <p style={{ margin: "16px 0 0", fontWeight: 600 }}>{delegate.chapterName}</p>
    </div>
  );
});
