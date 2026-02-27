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

interface ConsultantProfileApprovedEmailProps {
  consultantName?: string;
  profileUrl?: string;
  relayUrl?: string;
}

export const ConsultantProfileApprovedEmail = ({
  consultantName,
  profileUrl,
  relayUrl,
}: ConsultantProfileApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your consultant profile has been approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Logo />
          </Section>

          <Heading style={h1}>Congratulations! Your Profile is Live</Heading>

          <Text style={text}>
            Hi{consultantName && ` ${consultantName}`},
          </Text>

          <Text style={text}>
            Great news! Your consultant profile has been reviewed and approved to join
            the Rebound marketplace. Your profile is now visible to institutions looking
            for higher education consulting expertise.
          </Text>

          <Section style={successBox}>
            <Text style={successText}>
              <strong>What's Next?</strong>
            </Text>
            <Text style={successText}>
              • Complete your Stripe Connect onboarding to receive payments
            </Text>
            <Text style={successText}>
              • Keep your profile and availability up to date
            </Text>
            <Text style={successText}>
              • Be ready to respond to engagement inquiries from institutions
            </Text>
          </Section>

          <Text style={text}>
            Institutions can now discover you through Relay and initiate engagements for
            your consulting services.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={profileUrl}>
              View Your Profile
            </Button>
          </Section>

          <Section style={divider} />

          <Text style={text}>
            <strong>Ready to receive payments?</strong>
          </Text>
          <Text style={text}>
            Set up your Stripe Connect account to receive direct payouts for your
            consulting work.
          </Text>

          <Section style={buttonContainer}>
            <Button style={secondaryButton} href={relayUrl + "/onboarding"}>
              Set Up Payments
            </Button>
          </Section>

          <Text style={footerText}>
            Welcome to the Rebound community! If you have any questions, don't hesitate
            to reach out.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ConsultantProfileApprovedEmail;

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

const successBox = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #10b981",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
};

const successText = {
  color: "#065f46",
  fontSize: "14px",
  lineHeight: "1.5",
  marginBottom: "8px",
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

const secondaryButton = {
  backgroundColor: "#4f46e5",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};

const divider = {
  borderTop: "1px solid #e5e7eb",
  marginTop: "32px",
  marginBottom: "32px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "14px",
  marginTop: "24px",
};
