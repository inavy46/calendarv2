
import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const categories = [
  { name: "會議", icon: "📅", color: "#8884d8" },
  { name: "溝通", icon: "💬", color: "#82ca9d" },
  { name: "產品設計", icon: "🎨", color: "#ffc658" },
  { name: "研究", icon: "🔬", color: "#d0ed57" },
  { name: "案場排查", icon: "🔍", color: "#a4de6c" },
  { name: "其他", icon: "📌", color: "#ff8042" },
];

const funnyQuotes = [
  "這工作量讓我懷疑人生。",
  "每天都在開會，會會相連到天邊。",
  "進度永遠趕不上變更。",
  "我不是在工作，就是在準備工作。",
  "我需要的不只是咖啡，還有奇蹟。",
  "時間不夠用，還要開報告會議。",
];

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    category: categories[0].name,
    start: new Date(),
    end: new Date(),
  });

  const addOrUpdateEvent = () => {
    if (selectedEvent) {
      setEvents(
        events.map((e) =>
          e === selectedEvent ? { ...newEvent, id: selectedEvent.id } : e
        )
      );
    } else {
      setEvents([...events, { ...newEvent, id: Date.now() }]);
    }
    setShowDialog(false);
    setSelectedEvent(null);
  };

  const deleteEvent = () => {
    setEvents(events.filter((e) => e !== selectedEvent));
    setShowDialog(false);
    setSelectedEvent(null);
  };

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent({ title: "", category: categories[0].name, start, end });
    setSelectedEvent(null);
    setShowDialog(true);
  };

  const handleSelectEvent = (event) => {
    setNewEvent(event);
    setSelectedEvent(event);
    setShowDialog(true);
  };

  const summary = categories.map((cat) => {
    const totalMs = events
      .filter((e) => e.category === cat.name)
      .reduce((sum, e) => sum + (e.end - e.start), 0);
    return {
      name: `${cat.icon} ${cat.name}`,
      value: totalMs / 3600000,
      color: cat.color,
    };
  });

  const quote = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">chia's 工作行事曆</h1>
      <p className="text-sm text-gray-500 mb-4 italic">{quote}</p>

      <Calendar
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]">
            <h2 className="text-xl font-bold mb-2">
              {selectedEvent ? "編輯工作" : "新增工作"}
            </h2>
            <input
              className="w-full border p-2 mb-2"
              placeholder="工作內容"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <select
              className="w-full border p-2 mb-2"
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <label className="text-sm">開始時間</label>
            <input
              type="datetime-local"
              className="w-full border p-2 mb-2"
              value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setNewEvent({ ...newEvent, start: new Date(e.target.value) })
              }
            />
            <label className="text-sm">結束時間</label>
            <input
              type="datetime-local"
              className="w-full border p-2 mb-2"
              value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setNewEvent({ ...newEvent, end: new Date(e.target.value) })
              }
            />
            <div className="flex justify-between">
              <Button onClick={addOrUpdateEvent} className="mr-2">
                儲存
              </Button>
              {selectedEvent && (
                <Button variant="destructive" onClick={deleteEvent}>
                  刪除
                </Button>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <Card className="mt-8">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">📊 每月工作時間佔比</h2>
          <PieChart width={400} height={300}>
            <Pie
              dataKey="value"
              data={summary}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => entry.name}
            >
              {summary.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>
    </div>
  );
}
