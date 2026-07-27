"use client";

import { useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { RegistrationDetails } from "@/components/RegistrationDetails";
import { KitConfirmationForm } from "@/components/KitConfirmationForm";
import { HeroBanner } from "@/components/HeroBanner";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Delegate } from "@/lib/types";

type Step = "search" | "details" | "confirm" | "success";

export default function Home() {
  const [step, setStep] = useState<Step>("search");
  const [selected, setSelected] = useState<Delegate | null>(null);

  function reset() {
    setStep("search");
    setSelected(null);
  }

  function handleSelect(delegate: Delegate) {
    setSelected(delegate);
    setStep("details");
  }

  return (
    <>
      <IntroOverlay />
      {step === "search" ? (
        <div style={{ padding: "24px 16px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <HeroBanner>
              <h1 style={{ fontSize: 22, marginBottom: 10 }}>Registration Confirmation Portal</h1>
              <p style={{ color: "var(--slate-800)", fontWeight: 500, margin: "0 0 6px", lineHeight: 1.4 }}>
                Welcome to the 46th JCI Visayas Area Conference Registration Confirmation Portal.
              </p>
              <p style={{ color: "var(--slate-600)", margin: "0 0 6px", lineHeight: 1.4 }}>
                To verify your registration, simply type your name in the search bar below.
              </p>
              <p style={{ color: "var(--slate-600)", margin: "0 0 14px", lineHeight: 1.4 }}>
                Once your details appear, review your information and complete your registration
                confirmation.
              </p>
              <SearchInput onSelect={handleSelect} />
            </HeroBanner>
          </div>
        </div>
      ) : (
        <div style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
          {step === "details" && selected && (
            <RegistrationDetails
              delegate={selected}
              onConfirm={() => setStep("confirm")}
              onBack={reset}
            />
          )}

          {step === "confirm" && selected && (
            <KitConfirmationForm
              delegate={selected}
              onSuccess={() => setStep("success")}
              onAlreadyConfirmed={() => {
                setSelected({ ...selected, kitConfirmed: true });
                setStep("details");
              }}
              onBack={() => setStep("details")}
            />
          )}

          {step === "success" && (
            <Card style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--green), var(--green-light))",
                  color: "var(--white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto 16px",
                }}
              >
                ✓
              </div>
              <h2>Registration Confirmed!</h2>
              <p style={{ color: "var(--slate-600)" }}>
                Thank you for confirming your registration. Your attendance and conference kit
                receipt have been successfully recorded.
              </p>
              <p style={{ color: "var(--slate-600)" }}>
                We wish you a meaningful and enjoyable experience at the 46th JCI Visayas Area
                Conference – HALA BIRA: Rhythm of Change.
              </p>
              <Button onClick={reset}>Done</Button>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
