import { Card, CardContent } from "@/components/ui/card";
import { CheckIcon, ChevronDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Country, ICountry } from "country-state-city";
import { useState } from "react";

interface KpiCardProps {
    title: string;
    value: string | number;
    percentageChange?: number;
    comparisonText?: string;
    icon: LucideIcon;
    iconColor: string;
    iconBgColor: string;
    loading?: boolean;
    fieldKey?: string;
    setOpenDetails?: (open: boolean) => void;
}

export default function KpiCard({
    title,
    value,
    icon: Icon,
    iconColor,
    iconBgColor,
    loading = false,
    fieldKey,
    setOpenDetails
}: KpiCardProps) {
    const [popOpen, setPopOpen] = useState<boolean>(false);
    const [country, setCountry] = useState<ICountry | null>(null);
    const countries: Array<ICountry> = Country.getAllCountries();

    const handleOpenDetails = () => {
        if (setOpenDetails) {
            setOpenDetails(true);
        }
    };

    if (loading) {
        return (
            <Card className="border border-gray-100">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                    <Skeleton className="h-9 w-32 mt-3" />
                    <Skeleton className="h-5 w-40 mt-2" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-100">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    {fieldKey && fieldKey === "Transaction"
                        ? (
                            <Popover open={popOpen} onOpenChange={() => setPopOpen(!popOpen)}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox" size="md"
                                        aria-expanded={popOpen}
                                        className="w-[90px] justify-between"
                                    >
                                        {country
                                            ? (
                                                <div className="flex items-center gap-1">
                                                    <img src={`https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`} alt="" width={16} height={16} />
                                                    {country.isoCode}
                                                </div>
                                            )
                                            : "US"}
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search framework..." />
                                        <CommandList>
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup>
                                                {countries.map((c) => (
                                                    <CommandItem
                                                        key={c.isoCode}
                                                        value={c.isoCode}
                                                        onSelect={(currentValue) => {
                                                            const country = countries.find((c) => c.isoCode === currentValue);
                                                            if (country) setCountry(country);
                                                            setPopOpen(false);
                                                        }}
                                                    >
                                                        <CheckIcon
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                c.isoCode === country?.isoCode ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <img src={`https://flagcdn.com/w320/${c.isoCode.toLowerCase()}.png`} alt="" width={18} height={18} />
                                                        {c.isoCode}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <button className={cn("p-2 rounded-md", iconBgColor)} onClick={handleOpenDetails}>
                                <Icon className={cn("h-5 w-5", iconColor)} />
                            </button>
                        )
                    }
                </div>
                <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
            </CardContent>
        </Card>
    );
}
