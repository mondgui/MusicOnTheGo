// app/teacher-dashboard.tsx
import { Redirect, type Href } from "expo-router";

export default function TeacherDashboardEntry() {
  // Cast string as Href so TypeScript is happy
  return <Redirect href={"/(teacher)/dashboard" as Href} />;
}
