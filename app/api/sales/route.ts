import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

const DATA_PATH = path.resolve(process.cwd(), "data/sales.json");

export async function GET() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json([]);
    }
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    const data = JSON.parse(raw || "[]");
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let toAdd = [];
    if (Array.isArray(body)) toAdd = body;
    else toAdd = [body];

    // ensure file exists
    let current: any[] = [];
    if (fs.existsSync(DATA_PATH)) {
      const raw = fs.readFileSync(DATA_PATH, "utf-8");
      current = JSON.parse(raw || "[]");
    }

    const merged = [...toAdd, ...current];
    fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2), "utf-8");

    return NextResponse.json({ added: toAdd.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2), "utf-8");
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
