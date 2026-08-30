import type { WorkflowState } from "../schema";

export function runComplianceStage(state: WorkflowState): WorkflowState {
  const hasAtRiskCertification = state.affectedCapabilities.some(
    (capability) => capability.id === "CAP-PPC-004" && capability.status === "AT RISK",
  );
  const complianceFindings = state.recoveryPaths.map((path) => {
    const usesColdChain = path.composition.some(
      (item) =>
        state.availableResources.find((resource) => resource.id && item.includes(resource.id))
          ?.kind === "route",
    );
    const findings = [
      ...(hasAtRiskCertification
        ? ["Precision Polymer Certification is at risk and requires human verification."]
        : []),
      ...(usesColdChain ? ["GDP cold-chain sign-off is required before execution."] : []),
    ];
    return {
      pathId: path.id,
      status: findings.length === 0 ? ("PASS" as const) : ("REVIEW_REQUIRED" as const),
      findings: findings.length
        ? findings
        : ["No blocking compliance findings from available data."],
    };
  });
  const eligible = state.comparison.filter((entry) => {
    const status = complianceFindings.find((finding) => finding.pathId === entry.pathId)?.status;
    return status === "PASS" || status === "REVIEW_REQUIRED";
  });
  const recommendedPathId = eligible[0]?.pathId ?? null;
  const recommendedPath = state.recoveryPaths.find((path) => path.id === recommendedPathId) ?? null;
  return {
    ...state,
    complianceFindings,
    recommendedPath,
    recommendedPathId,
    trace: [
      ...state.trace,
      {
        stage: "COMPLIANCE",
        status: "COMPLETE",
        summary: `${complianceFindings.filter((finding) => finding.status === "REVIEW_REQUIRED").length} paths require human compliance review.`,
      },
    ],
  };
}
