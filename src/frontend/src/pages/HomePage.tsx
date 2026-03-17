import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Globe2,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { value: "12,400+", label: "Active Groups" },
  { value: "98,200+", label: "People Located" },
  { value: "4.8s", label: "Avg SOS Response" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  {
    icon: Users,
    step: "01",
    title: "Create or Join a Group",
    description:
      "Start a group with a unique code and invite your family, friends, or team members to join instantly.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "Share Your Location",
    description:
      "With one tap, share your GPS coordinates with everyone in your group. Updates happen in real time.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Get Alerts Instantly",
    description:
      "Receive immediate notifications for SOS alerts, missing persons, and unusual activity from your network.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "End-to-End Safety",
    desc: "All data is encrypted and stored securely on the blockchain.",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    desc: "GPS location updates delivered in under 2 seconds.",
  },
  {
    icon: Globe2,
    title: "Works Everywhere",
    desc: "Full coverage across all mobile networks and devices.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-bg.dim_1600x900.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative container py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Badge className="mb-6 bg-accent/20 text-accent-foreground border-accent/30 backdrop-blur">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Trusted by 50,000+
              families worldwide
            </Badge>
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-tight mb-6">
              Stay Connected.
              <br />
              <span className="text-accent">Stay Safe.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
              SafeTrack brings your group together with live GPS tracking,
              missing person reporting, and instant SOS alerts — all in one
              powerful platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                data-ocid="hero.track_group_button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12"
              >
                <Link to="/tracking">
                  <Users className="w-4 h-4 mr-2" /> Track Group
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                data-ocid="hero.report_missing_button"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur font-semibold px-8 h-12"
              >
                <Link to="/report">
                  <MapPin className="w-4 h-4 mr-2" /> Report Missing Person
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="mb-4 text-primary border-primary/30"
            >
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Three steps to safety
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Get your group set up and protected in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border shadow-card hover:shadow-card-hover transition-shadow group">
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <step.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold tracking-widest text-muted-foreground">
                          {step.step}
                        </span>
                        <h3 className="font-display font-bold text-xl mt-1 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">
                    {f.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-primary p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/40 opacity-80" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
                Ready to protect your group?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of families and teams using SafeTrack every day.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary font-bold hover:bg-white/90 px-8 h-12"
              >
                <Link to="/tracking">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
