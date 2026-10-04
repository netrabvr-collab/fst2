import { Text } from "@react-email/components";
import EmailLayout from "./layout";

export default function AlertEmail({ name, amount, id }: { name: string; amount: number; id: string }) {
  return (
    <EmailLayout preview="Large transaction recorded" title="Critical activity alert">
      <Text>Hi {name}, a transaction of <b>₹{amount.toFixed(2)}</b> was recorded on your account.</Text>
      <Text style={{ color: "#666" }}>Reference: {id}</Text>
    </EmailLayout>
  );
}
