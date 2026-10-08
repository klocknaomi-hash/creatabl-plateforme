"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Globe, Heart, MessageCircle, Music2, MoreHorizontal, Repeat2, Send, Share2, ThumbsUp } from "lucide-react";
import NetworkLogo, { toNetwork } from "@/components/ds/NetworkLogo";
import { ruleFor } from "@/lib/network-rules";

interface MediaFile {
  url: string;
  name: string;
  mimeType?: string | null;
}

interface Account {
  id: string;
  platform: string;
  username: string;
  avatarUrl?: string;
}

interface PostPreviewProps {
  content: string;
  mediaFiles: MediaFile[];
  platforms: string[];
  scheduledAt?: Date | null;
}

const isVideo = (m: MediaFile) => (m.mimeType ?? "").startsWith("video") || /\.(mp4|mov|webm|m4v)(\?|$)/i.test(m.url);

function Media({ file, ratio }: { file: MediaFile; ratio: string }) {
  return (
    <div style={{ aspectRatio: ratio, background: "#F0F0F3", overflow: "hidden" }}>
      {isVideo(file) ? (
        <video src={file.url} className="size-full object-cover" muted playsInline />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={file.url} alt="" className="size-full object-cover" />
      )}
    </div>
  );
}

function MediaPlaceholder({ ratio, text }: { ratio: string; text: string }) {
  return (
    <div className="cr-visual cr-visual--tint" style={{ aspectRatio: ratio, justifyContent: "center", alignItems: "center", padding: 16 }}>
      <span style={{ font: "500 13px/18px var(--font-text)", textAlign: "center" }}>{text}</span>
    </div>
  );
}

function Avatar({ src, name, size = 34, square = false }: { src?: string; name: string; size?: number; square?: boolean }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: square ? 6 : "50%", objectFit: "cover", flex: "none" }} />
  ) : (
    <span className="cr-avatar" style={{ width: size, height: size, borderRadius: square ? 6 : "50%", fontSize: size / 2.6 }}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/** Texte coupé là où le réseau affiche « … plus », hashtags mis en évidence. */
function Folded({ text, foldAt, more, tagClass }: { text: string; foldAt: number; more: string; tagClass?: string }) {
  const [open, setOpen] = useState(false);
  const chars = Array.from(text);
  const cut = !open && chars.length > foldAt;
  const shown = cut ? chars.slice(0, foldAt).join("").trimEnd() : text;
  const parts = shown.split(/(#[\p{L}\p{N}_]+)/u);
  return (
    <>
      {parts.map((p, i) => (p.startsWith("#") && tagClass ? <span key={i} className={tagClass}>{p}</span> : <span key={i}>{p}</span>))}
      {cut && (
        <button type="button" onClick={() => setOpen(true)} style={{ color: "#737373", background: "none", border: 0, padding: 0, marginLeft: 4, cursor: "pointer", font: "inherit" }}>
          … {more}
        </button>
      )}
    </>
  );
}

function whenLabel(date?: Date | null) {
  if (!date) return "Publication immédiate";
  return `Programmé · ${date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à ${date.getHours()} h ${String(date.getMinutes()).padStart(2, "0")}`;
}

// Post Preview du design system : reproduction de la publication telle qu'elle apparaîtra
// sur chaque réseau, avec son format, son ratio et sa coupure de texte.
export function PostPreview({ content, mediaFiles, platforms, scheduledAt }: PostPreviewProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data.accounts || []))
      .catch(console.error);
  }, []);

  const current = platforms.includes(activeTab) ? activeTab : platforms[0] ?? "";

  const account = useMemo(
    () => accounts.find((a) => a.platform.toLowerCase() === current.toLowerCase()),
    [accounts, current]
  );

  if (platforms.length === 0) {
    return (
      <div className="cr-empty" style={{ background: "var(--white)", border: "1px dashed var(--border-control)", borderRadius: "var(--cr-radius-md)", width: "100%" }}>
        <h4>Aperçu du post</h4>
        <p>Sélectionnez un réseau pour voir votre post tel qu&apos;il apparaîtra.</p>
      </div>
    );
  }

  const rule = ruleFor(current);
  const username = account?.username || "votre_compte";
  const text = content || "Votre texte apparaîtra ici.";
  const ratio = rule?.ratio ?? "1 / 1";

  const renderPreview = () => {
    switch (current.toLowerCase()) {
      case "instagram":
        return (
          <div className="cr-ig" aria-label="Aperçu Instagram">
            <div className="cr-ig-head">
              <span className="cr-ig-ring"><Avatar src={account?.avatarUrl} name={username} size={34} /></span>
              <div><strong>{username}</strong></div>
              <span className="cr-ig-more"><MoreHorizontal size={20} aria-hidden="true" /></span>
            </div>
            <div className="cr-ig-media" style={{ aspectRatio: ratio }}>
              {mediaFiles[0] ? <Media file={mediaFiles[0]} ratio={ratio} /> : <MediaPlaceholder ratio={ratio} text="Instagram exige une image ou une vidéo." />}
            </div>
            <div className="cr-ig-actions">
              <Heart size={24} aria-hidden="true" />
              <MessageCircle size={24} aria-hidden="true" />
              <Send size={24} aria-hidden="true" />
              {mediaFiles.length > 1 && <span style={{ fontSize: 12, color: "#5F5F6E", alignSelf: "center" }}>1/{mediaFiles.length}</span>}
              <span className="end"><Bookmark size={24} aria-hidden="true" /></span>
            </div>
            <div className="cr-ig-meta">
              <span><strong style={{ fontWeight: 600 }}>{username}</strong> <Folded text={text} foldAt={rule?.foldAt ?? 125} more="plus" tagClass="tags" /></span>
              <small>{whenLabel(scheduledAt)}</small>
            </div>
          </div>
        );

      case "facebook":
        return (
          <div className="cr-fb" aria-label="Aperçu Facebook">
            <div className="cr-fb-head">
              <Avatar src={account?.avatarUrl} name={username} size={38} />
              <div>
                <strong>{username}</strong>
                <small>{scheduledAt ? whenLabel(scheduledAt).replace("Programmé · ", "") : "À l'instant"} · <Globe size={12} aria-hidden="true" /></small>
              </div>
              <span className="cr-ig-more"><MoreHorizontal size={20} aria-hidden="true" /></span>
            </div>
            <div className="cr-fb-text"><Folded text={text} foldAt={rule?.foldAt ?? 480} more="Voir plus" /></div>
            {mediaFiles[0] && <div className="cr-fb-media" style={{ aspectRatio: ratio }}><Media file={mediaFiles[0]} ratio={ratio} /></div>}
            <div className="cr-fb-actions">
              <span><ThumbsUp size={18} aria-hidden="true" />J&apos;aime</span>
              <span><MessageCircle size={18} aria-hidden="true" />Commenter</span>
              <span><Share2 size={18} aria-hidden="true" />Partager</span>
            </div>
          </div>
        );

      case "linkedin":
        return (
          <div className="cr-fb" aria-label="Aperçu LinkedIn">
            <div className="cr-fb-head">
              <Avatar src={account?.avatarUrl} name={username} size={44} square />
              <div>
                <strong>{username}</strong>
                <small>{scheduledAt ? whenLabel(scheduledAt).replace("Programmé · ", "") : "Maintenant"} · <Globe size={12} aria-hidden="true" /></small>
              </div>
              <span className="cr-ig-more"><MoreHorizontal size={20} aria-hidden="true" /></span>
            </div>
            <div className="cr-fb-text"><Folded text={text} foldAt={rule?.foldAt ?? 210} more="voir plus" tagClass="font-semibold text-[#0A66C2]" /></div>
            {mediaFiles[0] && <div className="cr-fb-media" style={{ aspectRatio: ratio }}><Media file={mediaFiles[0]} ratio={ratio} /></div>}
            <div className="cr-fb-actions" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              <span><ThumbsUp size={18} aria-hidden="true" />J&apos;aime</span>
              <span><MessageCircle size={18} aria-hidden="true" />Commenter</span>
              <span><Repeat2 size={18} aria-hidden="true" />Republier</span>
              <span><Send size={18} aria-hidden="true" />Envoyer</span>
            </div>
          </div>
        );

      case "twitter": {
        const over = Array.from(content).length > 280;
        return (
          <div className="cr-fb" aria-label="Aperçu X" style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar src={account?.avatarUrl} name={username} size={40} />
              <div style={{ minWidth: 0, flex: 1, display: "grid", gap: 6 }}>
                <div style={{ fontSize: 15, lineHeight: "20px" }}>
                  <strong style={{ fontWeight: 700 }}>{username}</strong>{" "}
                  <span style={{ color: "#536471" }}>@{username.toLowerCase().replace(/\s+/g, "")} · {scheduledAt ? scheduledAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "maintenant"}</span>
                </div>
                <p style={{ fontSize: 15, lineHeight: "20px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {over ? (
                    <>
                      {Array.from(content).slice(0, 280).join("")}
                      <mark style={{ background: "var(--error-50)", color: "var(--error-600)" }}>{Array.from(content).slice(280).join("")}</mark>
                    </>
                  ) : (
                    <Folded text={text} foldAt={280} more="Afficher plus" tagClass="text-[#1D9BF0]" />
                  )}
                </p>
                {mediaFiles.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: mediaFiles.length > 1 ? "1fr 1fr" : "1fr", gap: 2, borderRadius: 16, overflow: "hidden", border: "1px solid #CFD9DE" }}>
                    {mediaFiles.slice(0, 4).map((m, i) => <Media key={i} file={m} ratio={mediaFiles.length > 1 ? "1 / 1" : ratio} />)}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", color: "#536471", maxWidth: 320 }}>
                  <MessageCircle size={18} aria-hidden="true" />
                  <Repeat2 size={18} aria-hidden="true" />
                  <Heart size={18} aria-hidden="true" />
                  <Bookmark size={18} aria-hidden="true" />
                  <Share2 size={18} aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "tiktok":
        return (
          <div aria-label="Aperçu TikTok" style={{ width: 260, aspectRatio: ratio, borderRadius: 16, overflow: "hidden", position: "relative", background: "#14121F", boxShadow: "var(--shadow-1)" }}>
            {mediaFiles[0] && isVideo(mediaFiles[0]) ? (
              <video src={mediaFiles[0].url} className="size-full object-cover" muted playsInline />
            ) : (
              <div className="grid size-full place-items-center p-6 text-center text-sm text-white/80">TikTok n&apos;accepte que la vidéo verticale (9:16).</div>
            )}
            <div style={{ position: "absolute", left: 12, right: 56, bottom: 14, color: "#fff", fontSize: 13, lineHeight: "18px", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
              <strong style={{ display: "block", marginBottom: 4 }}>@{username}</strong>
              <Folded text={text} foldAt={rule?.foldAt ?? 150} more="plus" />
              <span style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 6 }}><Music2 size={14} aria-hidden="true" />Son original</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="cr-fb" style={{ padding: 14 }}>
            <p style={{ fontSize: 14, lineHeight: "20px", whiteSpace: "pre-wrap" }}>{text}</p>
            {mediaFiles[0] && <Media file={mediaFiles[0]} ratio={ratio} />}
          </div>
        );
    }
  };

  return (
    <div className="grid w-full justify-items-center gap-4">
      {platforms.length > 1 && (
        <div className="cr-segment max-w-full overflow-x-auto" role="tablist" aria-label="Réseau de l'aperçu">
          {platforms.map((p) => {
            const net = toNetwork(p);
            return (
              <button key={p} type="button" role="tab" aria-selected={p === current} className="cr-tab" onClick={() => setActiveTab(p)}>
                {net && <NetworkLogo name={net} size={14} />}
                {ruleFor(p)?.label ?? p}
              </button>
            );
          })}
        </div>
      )}
      <div className="grid w-full justify-items-center">{renderPreview()}</div>
      {rule && (
        <p className="max-w-[40ch] text-center text-xs text-[#6B6780]">
          Format {rule.label} : {rule.ratioLabel}, {rule.maxChars.toLocaleString("fr-FR")} caractères maximum. L&apos;aperçu est indicatif : chaque réseau peut recadrer l&apos;image selon l&apos;appareil.
        </p>
      )}
    </div>
  );
}
