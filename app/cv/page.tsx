// Redirection de /cv vers /scan pour compatibilité avec d'anciens QR codes
import { redirect } from "next/navigation";

export default function OldCVPage() {
  redirect("/scan");
}
