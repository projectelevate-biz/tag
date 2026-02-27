import { Img, Text } from "@react-email/components";

export function Logo() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || "Rebound & Relay";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <Img
        src={`${baseUrl}/assets/logo.png`}
        width="32"
        height="32"
        alt={`${projectName} Logo`}
      />
      <Text style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
        {projectName}
      </Text>
    </div>
  );
}
