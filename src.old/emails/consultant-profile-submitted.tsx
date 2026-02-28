import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Logo } from "./logo";

interface ConsultantProfileSubmittedEmailProps {
  consultantName?: string;
  consultantEmail?: string;
  headline?: string;
  profileUrl?: string;
}

export const ConsultantProfileSubmittedEmail = ({
  consultantName,
  consultantEmail,
  headline,
  profileUrl,
}: ConsultantProfileSubmittedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New consultant profile submitted for review</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Logo />
          </Section>

          <Heading style={h1}>New Consultant Profile Awaiting Review</Heading>

          <Text style={text}>
            A new consultant has submitted their profile for review and approval to join
            the Rebound marketplace.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Consultant Information</Text>
            <Text style={infoText}>
              <strong>Name:</strong> {consultantName || "N/A"}
            </Text>
            <Text style={infoText}>
              <strong>Email:</strong> {consultantEmail || "N/A"}
            </Text>
            <Text style={infoText}>
              <strong>Headline:</strong> {headline || "N/A"}
            </Text>
          </Section>

          <Text style={text}>
            Please review their profile and approve or reject it based on our quality
            standards and requirements.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={profileUrl}>
              Review Profile
            </Button>
          </Section>

          <Text style={footerText}>
            You're receiving this email because you're an administrator of the Rebound
            & Relay platform.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ConsultantProfileSubmittedEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Inter, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logoSection = {
  padding: "24px",
  borderBottom: "1px solid #e5e7eb",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.25",
  marginTop: "32px",
  marginBottom: "16px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "16px",
};

const infoBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
};

const infoTitle = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "8px",
};

const infoText = {
  color: "#4b5563",
  fontSize: "14px",
  lineHeight: "1.5",
  marginBottom: "4px",
};

const buttonContainer = {
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#0d9488",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  marginTop: "24px",
};
