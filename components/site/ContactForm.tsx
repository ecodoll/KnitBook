"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorState from "@/components/knitbook/shared/ErrorState";

type ContactFormProps = {
  contactEmail: string;
};

/**
 * 문의 내용을 메일 초안으로 열어 주는 공개 연락 폼이다.
 */
const ContactForm = ({ contactEmail }: ContactFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("이름, 이메일, 내용을 모두 입력해 주세요.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("이메일 형식을 확인해 주세요.");
      return;
    }

    const subject = `[KnitBook 문의] ${name.trim()}`;
    const body = `보낸 사람: ${name.trim()} <${email.trim()}>\n\n${message.trim()}`;
    const href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="rounded-xl border border-border bg-card px-4 py-5 text-sm leading-7 text-muted-foreground">
        메일 앱이 열렸다면 그대로 보내 주세요. 열리지 않으면{" "}
        <a
          href={`mailto:${contactEmail}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {contactEmail}
        </a>
        으로 직접 보내 주셔도 됩니다.
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {errorMessage ? (
        <ErrorState title="문의 내용을 확인하지 못했어요" message={errorMessage} />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="contact-name">이름</Label>
        <Input
          id="contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">회신 이메일</Label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">내용</Label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          rows={6}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit">메일로 보내기</Button>
    </form>
  );
};

export default ContactForm;
