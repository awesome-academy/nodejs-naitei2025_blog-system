import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { DashboardAreaChart } from "../components/dashboard-area-chart";
import { DashboardBarChart } from "../components/dashboard-bar-chart";
import { DashboardCard } from "@/types/dashboard-card.type";
import { SidebarTrigger } from "@/components/ui/sidebar";

const cards: DashboardCard[] = [
  {
    title: "Tổng số bài viết",
    value: "120",
    change: "+5%",
  },
  {
    title: "Tổng số người dùng",
    value: "350",
    change: "+3%",
  },
  {
    title: "Tổng số tag",
    value: "45",
    change: "+2%",
  },
  {
    title: "Tổng lượt xem 30 ngày",
    value: "15,000",
    change: "+8%",
  },
];

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Label className="text-xl font-semibold">
          Bảng điều khiển tổng quan
        </Label>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title} className="aspect-video rounded-xl">
              <CardHeader>
                <CardDescription className="text-md">
                  {card.title}
                </CardDescription>
                <Label className="text-4xl font-bold">{card.value}</Label>
                <p className="text-sm text-green-700">
                  {card.change} so với tháng trước
                </p>
              </CardHeader>
              {/* <CardContent> */}
              {/* </CardContent> */}
            </Card>
          ))}
          <div className="col-span-2">
            <DashboardAreaChart />
          </div>
          <div className="col-span-2">
            <DashboardBarChart />
          </div>
        </div>
      </div>
    </>
  );
}
