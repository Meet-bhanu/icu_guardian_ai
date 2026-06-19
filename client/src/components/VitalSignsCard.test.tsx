import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import VitalSignsCard from "./VitalSignsCard";

describe("VitalSignsCard", () => {
  it("renders vital signs with normal values", () => {
    render(
      <VitalSignsCard
        heartRate={72}
        spO2={98}
        systolicBP={120}
        diastolicBP={80}
        temperature={37.2}
        respiratoryRate={16}
      />
    );

    expect(screen.getByText("Vital Signs")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("120/80")).toBeInTheDocument();
    expect(screen.getByText("37.2")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("displays missing values as dashes", () => {
    render(<VitalSignsCard />);

    const dashElements = screen.getAllByText("--");
    expect(dashElements.length).toBeGreaterThan(0);
  });

  it("shows alert badge when critical values are present", () => {
    render(
      <VitalSignsCard
        heartRate={140} // Critical high
        spO2={98}
        systolicBP={120}
        diastolicBP={80}
        temperature={37.2}
        respiratoryRate={16}
        showAlerts={true}
      />
    );

    expect(screen.getByText("Alert")).toBeInTheDocument();
  });

  it("does not show alert badge when showAlerts is false", () => {
    render(
      <VitalSignsCard
        heartRate={140} // Critical high
        spO2={98}
        systolicBP={120}
        diastolicBP={80}
        temperature={37.2}
        respiratoryRate={16}
        showAlerts={false}
      />
    );

    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
  });

  it("displays status legend", () => {
    render(
      <VitalSignsCard
        heartRate={72}
        spO2={98}
        systolicBP={120}
        diastolicBP={80}
        temperature={37.2}
        respiratoryRate={16}
      />
    );

    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
  });
});
