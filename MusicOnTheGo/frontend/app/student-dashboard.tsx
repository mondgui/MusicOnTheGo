// app/student-dashboard.tsx
import { Redirect, type Href } from "expo-router";

export default function StudentDashboardEntry() {
  // Cast string as Href so TypeScript is happy
  return <Redirect href={"/(student)/dashboard" as Href} />;
}
