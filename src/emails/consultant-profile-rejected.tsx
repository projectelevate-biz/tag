import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Logo } from "./logo";

interface ConsultantProfileRejectedEmailProps {
  consultantName?: string;
  rejectionReason?: string;
  profileUrl?: string;
}

export const ConsultantProfileRejectedEmail = ({
  consultantName,
  rejectionReason,
  profileUrl,
}: ConsultantProfileRejectedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Action Required: Updates needed for your consultant profile</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Logo />
          </Section>

          <Heading style={h1}>Updates Needed for Your Profile</Heading>

          <Text style={text}>
            Hi{consultantName && ` ${consultantName}`},
          </Text>

          <Text style={text}>
            Thank you for your interest in joining the Rebound marketplace. After reviewing
            your profile, we need some additional information or changes before we can
            approve it.
          </Text>

          <Section style={reasonBox}>
            <Text style={reasonTitle}>Feedback from Our Review Team:</Text>
            <Text style={reasonText}>
              {rejectionReason ||
                "Please provide more detailed information about your experience and expertise."}
            </Text>
          </Section>

          <Text style={text}>
            We're committed to maintaining high quality standards on our platform, and
            we want to make sure your profile best represents your expertise to
            institutions.
          </Text>

          <Section style={helpfulTipsBox}>
            <Text style={tipsTitle}>Common Areas for Improvement:</Text>
            <Text style={tipsText}>
              • Add more detail to your professional bio about your specific experience
            </Text>
            <Text style={tipsText}>
              • Include specific outcomes or achievements from your consulting work
            </Text>
            <Text style={tipsText}>
              • Upload relevant certifications or credentials
            </Text>
            <Text style={tipsText}>
              • Ensure your expertise tags accurately reflect your capabilities
            </Text>
          </Section>

          <Text style={text}>
            Please update your profile and submit it again for review. We look forward to
            seeing your improved application!
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={profileUrl}>
              Update My Profile
            </Button>
          </Section>

          <Text style={footerText}>
            If you have questions about this feedback or need guidance, please don't
            hesitate to reach out to our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ConsultantProfileRejectedEmail;

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

const reasonBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
};

const reasonTitle = {
  color: "#92400e",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "8px",
};

const reasonText = {
  color: "#78350f",
  fontSize: "14px",
  lineHeight: "1.5",
};

const helpfulTipsBox = {
  backgroundColor: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
};

const tipsTitle = {
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "8px",
};

const tipsText = {
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
