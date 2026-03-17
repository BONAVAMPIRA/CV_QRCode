// Redirection de /cv/email vers /scan pour compatibilité
import { redirect } from "next/navigation";

export default function OldEmailPage() {
  redirect("/scan");
}
