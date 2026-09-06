import { createFileRoute } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, MapPin, Phone, Clock, Utensils, Leaf, SlidersHorizontal, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import heroKebab from "@/assets/hero-kebab.webp";
import durumImg from "@/assets/durum.webp";
import plateImg from "@/assets/plate.webp";
import falafelImg from "@/assets/falafel.webp";

export const Route = createFileRoute("/")({
  component: Index,
});

const FB_URL = "https://www.facebook.com/kebabhousekunstat";
const IG_URL = "https://www.instagram.com/kebabhousekunstat";
const MAPS_URL =
  "https://www.google.com/maps/place/Kebab+House+Kun%C5%A1t%C3%A1t/@49.5069965,16.5178175,18z";
// WhatsApp: zadej reálné číslo ve formátu +420 XXX XXX XXX
const PHONE_NUMBER = "+420 000 000 000";
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER.replace(/\D/g, "")}`;

type MenuItem = { n: number; name: string; desc?: string; price: number; customizable?: boolean };
type MenuSection = { title: string; items: MenuItem[]; icon?: string };

const MENU: MenuSection[] = [
  {
    title: "Salát",
    items: [
      { n: 1, name: "Míchaný salát", price: 90 },
      { n: 2, name: "Salát s masem", price: 140 },
    ],
  },
  {
    title: "Turecký chleba",
    items: [
      { n: 3, name: "Döner kebab klasik", desc: "maso, salát a omáčka v tureckém chlebě", price: 140, customizable: true },
      { n: 4, name: "Döner kebab se sýrem", desc: "maso, salát, omáčka a sýr", price: 150, customizable: true },
      { n: 5, name: "Döner kebab jen maso", desc: "maso s omáčkou v tureckém chlebě", price: 160, customizable: true },
    ],
  },
  {
    title: "Tortilla Dürüm",
    items: [
      { n: 6, name: "Dürüm kebab klasik", desc: "maso, salát a omáčka v tortille", price: 145, customizable: true },
      { n: 7, name: "Dürüm kebab se sýrem", desc: "maso, salát, omáčka a sýr v tortille", price: 160, customizable: true },
      { n: 8, name: "Dürüm kebab jen maso", desc: "maso s omáčkou v tortille", price: 165, customizable: true },
    ],
  },
  {
    title: "Malý talíř",
    items: [
      { n: 9, name: "Malý talíř s chlebem", price: 165 },
      { n: 10, name: "Malý talíř s hranolkami", price: 165 },
      { n: 11, name: "Malý talíř s nudlemi", price: 165 },
      { n: 12, name: "Malý talíř jen maso", price: 170 },
    ],
  },
  {
    title: "Velký talíř",
    items: [
      { n: 13, name: "Velký talíř s chlebem", price: 185 },
      { n: 14, name: "Velký talíř s hranolkami", price: 185 },
      { n: 15, name: "Velký talíř s nudlemi", price: 185 },
      { n: 16, name: "Velký talíř jen maso", price: 200 },
    ],
  },
  {
    title: "Döner box",
    items: [
      { n: 17, name: "Döner box s hranolkami", price: 140 },
      { n: 18, name: "Döner box s nudlemi", price: 140 },
    ],
  },
  {
    title: "Vegetariánské",
    items: [
      { n: 19, name: "Talíř falafel", desc: "hrachové kuličky se salátem a omáčkou", price: 150 },
      { n: 20, name: "Dürüm falafel", desc: "hrachové kuličky, salát, omáčka v tortille", price: 140 },
      { n: 21, name: "Hranolky", price: 80 },
    ],
  },
  {
    title: "Stripsy",
    items: [
      { n: 22, name: "Stripsy v tortille", desc: "3 ks stripsy se salátem a omáčkou", price: 140 },
      { n: 23, name: "Velký talíř stripsy + hranolky", desc: "4 ks stripsy se salátem, omáčkou a hranolkami", price: 190 },
    ],
  },
];

const EXTRAS = [
  { name: "Extra maso", price: 50 },
  { name: "Extra sýr", price: 30 },
];
const SAUCES = ["Bylinková", "Česneková", "Chilli"];

// --- Konfigurátor kebabu (velikost / pečivo / pálivost / přídavky) --------
const SIZES = [
  { id: "standard", label: "Standard", extra: 0 },
  { id: "xl", label: "XL", extra: 45 },
  { id: "xxl", label: "XXL", extra: 85 },
] as const;

const LAVASH_TYPES = [
  { id: "klasicky", label: "Klasický" },
  { id: "syrovy", label: "Sýrový zlatý" },
  { id: "spenatovy", label: "Špenátový zelený" },
] as const;

const SPICE_LEVELS = [
  { id: "zadna", label: "Bez pálivosti", icon: "○" },
  { id: "pikantni", label: "Pikantní", icon: "🌶" },
  { id: "ohen", label: "Oheň", icon: "🌶🌶" },
  { id: "pekelny", label: "Pekelný", icon: "🌶🌶🌶" },
] as const;

const ADD_ONS = [
  { id: "double-meat", label: "Dvojité šťavnaté maso", price: 45 },
  { id: "cheddar", label: "Tažený sýr Cheddar", price: 35 },
  { id: "jalapeno", label: "Pálivé papričky Jalapeño", price: 25 },
  { id: "cibulka", label: "Křupavá zlatá cibulka smažená", price: 20 },
  { id: "extra-omacka", label: "Extra porce tajné omáčky", price: 25 },
  { id: "okurky", label: "Křupavé nakládané okurky", price: 20 },
] as const;

// --- Otevírací doba (živý indikátor, čas v Europe/Prague bez ohledu na TZ serveru) --
const OPENING_HOURS: Record<string, { open: string; close: string }> = {
  Mon: { open: "10:30", close: "21:00" },
  Tue: { open: "10:30", close: "21:00" },
  Wed: { open: "10:30", close: "21:00" },
  Thu: { open: "10:30", close: "21:00" },
  Fri: { open: "10:30", close: "22:00" },
  Sat: { open: "10:30", close: "22:00" },
  Sun: { open: "11:00", close: "21:00" },
};

function getPragueNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Prague",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  return { weekday: get("weekday"), minutes: hour * 60 + minute };
}

function useOpenStatus() {
  const [status, setStatus] = useState<{ open: boolean; text: string } | null>(null);
  useEffect(() => {
    function tick() {
      const { weekday, minutes } = getPragueNow();
      const hrs = OPENING_HOURS[weekday];
      if (!hrs) return;
      const [oh, om] = hrs.open.split(":").map(Number);
      const [ch, cm] = hrs.close.split(":").map(Number);
      const isOpen = minutes >= oh * 60 + om && minutes < ch * 60 + cm;
      setStatus({
        open: isOpen,
        text: isOpen ? `Nyní otevřeno do ${hrs.close}` : `Nyní zavřeno · otevíráme ${hrs.open}`,
      });
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

function OpenStatusBadge({ className = "" }: { className?: string }) {
  const status = useOpenStatus();
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {status.open && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            status.open ? "bg-emerald-400" : "bg-muted-foreground"
          }`}
        />
      </span>
      <span className={status.open ? "text-emerald-400" : "text-muted-foreground"}>{status.text}</span>
    </span>
  );
}

function ItemCustomizer({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [sizeId, setSizeId] = useState<(typeof SIZES)[number]["id"]>("standard");
  const [lavashId, setLavashId] = useState<(typeof LAVASH_TYPES)[number]["id"]>("klasicky");
  const [spiceId, setSpiceId] = useState<(typeof SPICE_LEVELS)[number]["id"]>("zadna");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);

  const total = useMemo(() => {
    const size = SIZES.find((s) => s.id === sizeId)!;
    const addOnsPrice = addOns.reduce((sum, id) => sum + (ADD_ONS.find((a) => a.id === id)?.price ?? 0), 0);
    return (item.price + size.extra + addOnsPrice) * qty;
  }, [sizeId, addOns, qty, item.price]);

  function toggleAddOn(id: string) {
    setAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addToOrder() {
    const lavash = LAVASH_TYPES.find((l) => l.id === lavashId)!;
    const spice = SPICE_LEVELS.find((s) => s.id === spiceId)!;
    toast.success(`${item.name} přidán do objednávky`, {
      description: `${qty}× · ${lavash.label} · ${spice.label} · ${total},- Kč`,
    });
    onClose();
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="mt-3 space-y-4 rounded-lg border border-primary/40 bg-background/60 p-4"
    >
      <PickerRow label="Velikost">
        {SIZES.map((s) => (
          <PickerButton key={s.id} active={sizeId === s.id} onClick={() => setSizeId(s.id)}>
            {s.label}
            {s.extra > 0 ? ` (+${s.extra} Kč)` : ""}
          </PickerButton>
        ))}
      </PickerRow>
      <PickerRow label="Typ pečiva">
        {LAVASH_TYPES.map((l) => (
          <PickerButton key={l.id} active={lavashId === l.id} onClick={() => setLavashId(l.id)}>
            {l.label}
          </PickerButton>
        ))}
      </PickerRow>
      <PickerRow label="Pálivost">
        {SPICE_LEVELS.map((s) => (
          <PickerButton key={s.id} active={spiceId === s.id} onClick={() => setSpiceId(s.id)}>
            {s.icon} {s.label}
          </PickerButton>
        ))}
      </PickerRow>
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Přidat do kebabu</p>
        <div className="space-y-1.5">
          {ADD_ONS.map((a) => (
            <label key={a.id} className="flex cursor-pointer items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addOns.includes(a.id)}
                  onChange={() => toggleAddOn(a.id)}
                  className="h-4 w-4 accent-primary"
                />
                {a.label}
              </span>
              <span className="whitespace-nowrap font-semibold text-primary">+{a.price} Kč</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Poznámka pro kuchaře</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Např. bez sladké papriky, více propečené"
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="p-1 text-muted-foreground hover:text-primary"
            aria-label="Ubrat"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-4 text-center font-semibold">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="p-1 text-muted-foreground hover:text-primary"
            aria-label="Přidat"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={addToOrder}
          className="rounded-full bg-gradient-to-r from-neon-red to-neon-ember px-5 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-transform duration-300 hover:scale-105"
        >
          Přidat do objednávky · {total},- Kč
        </button>
      </div>
    </div>
  );
}

function PickerRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PickerButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-primary/60"
      }`}
    >
      {children}
    </button>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" strokeWidth="0" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}


function FlipCard({
  front,
  back,
  delay = 0,
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  delay?: number;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="[perspective:1200px] h-[360px] cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden border-glow">
          {front}
        </div>
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-xl overflow-hidden border-glow bg-card">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="relative py-24 px-6 md:px-10">
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionTitle({ plain, accent }: { plain: string; accent: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="text-center mb-14">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        className="text-5xl md:text-7xl font-normal"
      >
        <span className="text-foreground">{plain} </span>
        <span className="text-gradient-neon animate-pulse-glow">{accent}</span>
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="neon-line mt-5 mx-auto w-32 origin-center"
      />
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Menu />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}


function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary text-glow-red" />
          <span className="font-display text-2xl tracking-widest text-glow-red animate-flicker">
            KEBAB HOUSE
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider">
          {[
            ["O nás", "#about"],
            ["Menu", "#menu"],
            ["Galerie", "#gallery"],
            ["Kontakt", "#contact"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="relative group text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-red to-neon-ember group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <OpenStatusBadge className="hidden sm:inline-flex" />
          <a href={IG_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
             className="p-2 rounded-full border border-border hover:border-primary hover:glow-red transition-all duration-300">
            <InstagramIcon className="h-4 w-4" />
          </a>
          <a href={FB_URL} target="_blank" rel="noreferrer" aria-label="Facebook"
             className="p-2 rounded-full border border-border hover:border-primary hover:glow-red transition-all duration-300">
            <FacebookIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroKebab} alt="" className="w-full h-full object-cover opacity-45" width={1600} height={1000} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line opacity-40 pointer-events-none" />

      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="uppercase tracking-[0.4em] text-sm text-primary mb-6 text-glow-red"
        >
          František Burian · Kunštát
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="text-6xl md:text-9xl font-normal leading-[0.9]"
        >
          <span className="block text-foreground">CHUŤ</span>
          <span className="block text-gradient-neon animate-pulse-glow">ORIENTU</span>
          <span className="block text-foreground text-4xl md:text-6xl mt-4">v srdci Kunštátu</span>
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="neon-line mt-8 mx-auto w-40 origin-center"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-8 max-w-xl mx-auto text-lg text-muted-foreground"
        >
          Čerstvé maso z rožně, domácí omáčky, křupavý falafel a útulná zahrádka.
          Otočte kartičku · objevte menu.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <a
            href="#menu"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-neon-red to-neon-ember text-primary-foreground font-semibold uppercase tracking-wider hover:scale-105 hover:glow-red transition-all duration-300"
          >
            Zobrazit menu
          </a>
          <a
            href="#contact"
            className="px-8 py-3 rounded-full border-2 border-primary/60 text-foreground font-semibold uppercase tracking-wider hover:border-primary hover:glow-red transition-all duration-300"
          >
            Rezervovat stůl
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function About() {
  const highlights = [
    { icon: Flame, title: "Ohnivý gril", text: "Maso pečené na klasickém rožni, po celý den čerstvé." },
    { icon: Utensils, title: "Poctivé porce", text: "Talíře, dürümy i döner boxy — pro každý hlad." },
    { icon: Leaf, title: "Vegetariánské", text: "Křupavý falafel a čerstvá zelenina od lokálních dodavatelů." },
  ];
  return (
    <Section id="about">
      <SectionTitle plain="O" accent="KEBAB HOUSE" />
      <div className="grid md:grid-cols-3 gap-6">
        {highlights.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            className="group relative rounded-xl p-8 bg-card border border-border hover:border-primary/60 transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h.icon className="h-10 w-10 text-primary text-glow-red relative" />
            <h3 className="mt-5 text-2xl uppercase tracking-wide relative">{h.title}</h3>
            <p className="mt-3 text-muted-foreground relative">{h.text}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Menu() {
  return (
    <Section id="menu">
      <SectionTitle plain="NAŠE" accent="MENU" />
      <p className="text-center text-muted-foreground -mt-6 mb-12">
        Najeďte kurzorem nebo klikněte na kategorii — kartička se otočí a odhalí ceník.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MENU.map((section, i) => (
          <FlipCard
            key={section.title}
            delay={(i % 3) * 0.1}
            front={<MenuFront title={section.title} img={menuImage(section.title)} />}
            back={<MenuBack section={section} />}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-10 grid md:grid-cols-2 gap-6"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="text-xl uppercase tracking-wide text-gradient-neon">Omáčky</h4>
          <div className="neon-line w-16 mt-2 mb-4" />
          <p className="text-muted-foreground">{SAUCES.join(" · ")}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="text-xl uppercase tracking-wide text-gradient-neon">Extra</h4>
          <div className="neon-line w-16 mt-2 mb-4" />
          <ul className="space-y-1">
            {EXTRAS.map((e) => (
              <li key={e.name} className="flex justify-between">
                <span>{e.name}</span>
                <span className="text-primary font-semibold">{e.price},- Kč</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </Section>
  );
}

function menuImage(title: string): string {
  if (title.includes("Vegetariánské")) return falafelImg;
  if (title.includes("Dürüm") || title.includes("Turecký") || title.includes("Döner"))
    return durumImg;
  return plateImg;
}

function MenuFront({ title, img }: { title: string; img: string }) {
  return (
    <div className="relative h-full w-full">
      <img src={img} alt={title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="neon-line w-12 mb-3" />
        <h3 className="text-3xl uppercase tracking-wide text-glow-red">{title}</h3>
        <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
          Otočit kartičku →
        </p>
      </div>
    </div>
  );
}

function MenuBack({ section }: { section: MenuSection }) {
  const [openItem, setOpenItem] = useState<number | null>(null);
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h3 className="text-2xl uppercase tracking-wide text-gradient-neon">{section.title}</h3>
      <div className="neon-line w-16 my-3" />
      <ul className="space-y-3">
        {section.items.map((it) => (
          <li key={it.n} className="border-b border-border/50 pb-2">
            <div className="flex justify-between items-baseline gap-3">
              <span className="font-medium">
                <span className="text-primary mr-2">{it.n}.</span>
                {it.name}
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-primary font-bold">{it.price},- Kč</span>
                {it.customizable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenItem((o) => (o === it.n ? null : it.n));
                    }}
                    aria-label="Přizpůsobit kebab"
                    className={`rounded-md border p-1.5 transition-colors ${
                      openItem === it.n
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/60"
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </div>
            {it.desc && <p className="text-xs text-muted-foreground mt-1">{it.desc}</p>}
            {it.customizable && openItem === it.n && (
              <ItemCustomizer item={it} onClose={() => setOpenItem(null)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Gallery() {
  const imgs = [heroKebab, durumImg, plateImg, falafelImg];
  return (
    <Section id="gallery">
      <SectionTitle plain="Z" accent="KUCHYNĚ" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {imgs.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9, rotateY: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="group relative overflow-hidden rounded-xl border-glow aspect-square"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Contact() {
  const items = [
    { icon: MapPin, title: "Adresa", lines: ["Náměstí Míru 27", "679 72 Kunštát"], href: MAPS_URL },
    { icon: Clock, title: "Otevírací doba", lines: ["Po–Čt  10:30 – 21:00", "Pá–So  10:30 – 22:00", "Ne  11:00 – 21:00"] },
    { icon: Phone, title: "Kontakt", lines: ["Napsat na WhatsApp", PHONE_NUMBER], href: WHATSAPP_URL },
  ];
  return (
    <Section id="contact">
      <SectionTitle plain="POJĎTE" accent="OCHUTNAT" />
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((it, i) => {
          const Card = (
            <div className="h-full rounded-xl bg-card border border-border p-8 group-hover:border-primary/60 transition-all duration-500 hover:-translate-y-1">
              <it.icon className="h-8 w-8 text-primary text-glow-red" />
              <h3 className="mt-5 text-xl uppercase tracking-wide">{it.title}</h3>
              <div className="neon-line w-10 my-3" />
              {it.lines.map((l) => (
                <p key={l} className="text-muted-foreground">{l}</p>
              ))}
              {it.title === "Otevírací doba" && <OpenStatusBadge className="mt-3" />}
            </div>
          );
          return (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group"
            >
              {it.href ? (
                <a href={it.href} target={it.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {Card}
                </a>
              ) : (
                Card
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-10 rounded-xl overflow-hidden border-glow aspect-[16/7]"
      >
        <iframe
          title="Mapa"
          src="https://www.google.com/maps?q=Kebab+House+Kun%C5%A1t%C3%A1t&output=embed"
          className="w-full h-full grayscale-[0.4] contrast-125"
          loading="lazy"
        />
      </motion.div>
    </Section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-12 px-6">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary text-glow-red" />
          <span className="font-display text-xl tracking-widest text-glow-red">KEBAB HOUSE KUNŠTÁT</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={FB_URL} target="_blank" rel="noreferrer"
             className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary hover:glow-red transition-all duration-300">
            <FacebookIcon className="h-4 w-4" /> Facebook
          </a>
          <a href={IG_URL} target="_blank" rel="noreferrer"
             className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary hover:glow-red transition-all duration-300">
            <InstagramIcon className="h-4 w-4" /> Instagram
          </a>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} František Burian
        </p>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Napsat na WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-whatsapp text-whatsapp-foreground font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}


