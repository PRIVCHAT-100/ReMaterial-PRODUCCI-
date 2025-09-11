import { useState, useEffect } from "react";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerHero from "@/components/BannerHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Package, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Company = {
  id: string;
  company_name: string | null;
  sector: string | null;
  location: string | null;
  logo_url?: string | null;
  description?: string | null;
  productCount?: number;
  rating?: number;
  reviews?: number;
};

const Companies = () => {
  const { t } = useTranslation();

  const COMPANY_BANNERS = [
    {
      id: "s1",
      image:
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2000&auto=format&fit=crop",
      href: "/messages",
      label: "Patrocinado: Envases retornables",
      alt: "Palets y cajas retornables",
      objectPosition: "center",
    },
    {
      id: "s2",
      image:
        "https://images.unsplash.com/photo-1518618021020-8ee98c65f7a0?q=80&w=2000&auto=format&fit=crop",
      href: "/explore?tag=metal",
      label: t("ui.acuerdos-con-metal-rgicas"),
      alt: "Bobinas metálicas",
      objectPosition: "center top",
    },
    {
      id: "s3",
      image:
        "https://images.unsplash.com/photo-1552871212-5d5c9086a0d2?q=80&w=2000&auto=format&fit=crop",
      href: "/explore?tag=madera",
      label: t("ui.madera-recuperada"),
      alt: "Tablas de madera",
      objectPosition: "50% 40%",
    },
  ];

  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedSector]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, company_name, sector, location, logo_url, description")
        .not("company_name", "is", null)
        .or("is_seller.eq.true,is_seller.is.null");

      if (error) throw error;

      const companiesWithStats: Company[] = await Promise.all(
        (data || []).map(async (company: Company) => {
          const { data: products } = await supabase
            .from("products")
            .select("id")
            .eq("seller_id", company.id)
            .eq("status", "active");

          return {
            ...company,
            productCount: products?.length || 0,
            rating: 4.5,
            reviews: Math.floor(Math.random() * 50) + 5,
          };
        })
      );

      setCompanies(companiesWithStats);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          (c.company_name || "").toLowerCase().includes(q) ||
          (c.location || "").toLowerCase().includes(q)
      );
    }
    if (selectedSector !== "all") {
      filtered = filtered.filter((c) => c.sector === selectedSector);
    }
    setFilteredCompanies(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-3 md:px-6 pt-2">
        <section>
          <BannerHero
            items={COMPANY_BANNERS}
            heightClass="h-[220px] md:h-[300px] lg:h-[360px]"
            showArrows
            showDots
            className="rounded-2xl shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.01] transition"
          />
        </section>

        <section className="mt-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Empresas</h1>
          <p className="text-muted-foreground text-sm">
            Explora empresas, filtra por sector y localización, y descubre sus
            productos.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Companies;
