import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";

// Reusable shell shared by every template (modular design)
export default function EmailLayout({ preview, title, children }: { preview: string; title: string; children: ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ background: "#f4f4f5", fontFamily: "Arial, sans-serif", padding: "24px 0" }}>
        <Container style={{ background: "#fff", borderRadius: 8, padding: 32, maxWidth: 480 }}>
          <Heading style={{ fontSize: 22, margin: "0 0 16px" }}>{title}</Heading>
          {children}
          <Text style={{ color: "#888", fontSize: 12, marginTop: 24 }}>FST Assignment 2 • automated message</Text>
        </Container>
      </Body>
    </Html>
  );
}
