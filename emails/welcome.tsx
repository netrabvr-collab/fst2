import { Button, Text } from "@react-email/components";
import EmailLayout from "./layout";

export default function WelcomeEmail({ name }: { name: string }) {
  const url = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return (
    <EmailLayout preview="Your account is confirmed" title={`Welcome, ${name}!`}>
      <Text>Your account has been created successfully.</Text>
      <Button href={`${url}/dashboard`} style={{ background: "#111", color: "#fff", padding: "10px 18px", borderRadius: 6 }}>
        Open dashboard
      </Button>
    </EmailLayout>
  );
}
