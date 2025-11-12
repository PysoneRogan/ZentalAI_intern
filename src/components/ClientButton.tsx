"use client";
 
import Button  from './Button';
 
export default function BackButton() {
  return (
<Button
      variant="ghost"
      onClick={() => window.history.back()}
      className="flex items-center gap-2"
>
      ← Back
</Button>
  );
}