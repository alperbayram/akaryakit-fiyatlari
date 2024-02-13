import type { Schema } from "muninn";
import { parse } from "muninn";
import { schema } from "../schema";
import { CITIES } from "../const";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600; // 60*60*1
export const preferredRegion = ["fra1", "cdg1", "dub1"];

export async function GET(
  request: NextRequest,
  { params }: { params: { sehir: string } },
) {
  const sehir = params.sehir;
  const code = CITIES[sehir];

  if (!code) {
    return new Response("Geçersiz şehir adı", {
      status: 400,
    });
  }

  const url = `https://www.petrolofisi.com.tr/akaryakit-fiyatlari/${sehir}-akaryakit-fiyatlari`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.text();

    const result = parse(data, schema as Schema);

    return Response.json(result, {
      status: 200,
      headers: {
        "Content-type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response("Failed to fetch the data", { status: 500 });
  }
}
