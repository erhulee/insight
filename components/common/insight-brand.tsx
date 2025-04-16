import { AudioLines } from "lucide-react";
import Link from "next/link";

export function InsightBrand() {
    return (
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <AudioLines></AudioLines>
            <span>Insight</span>
        </Link>
    )
}