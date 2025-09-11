// api.js
export async function createPip(pipname, pipcontent) {
  const payload = { pipname, pipcontent }; // <- matcher PHP POST
  const response = await fetch("http://127.0.0.1:8000/pips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`POST /pips ${response.status}`);
  return response.json();
}

export async function getData(cursor = null, limit = 3) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor?.before_time && cursor?.before_id != null) {
    params.set("before_time", cursor.before_time);
    params.set("before_id", String(cursor.before_id));
  }
  const url = `http://127.0.0.1:8000/pips?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /pips ${res.status}`);
  const data = await res.json(); // { items: [...], has_more: bool }

  const items = Array.isArray(data?.items) ? data.items : [];
  const hasMore = !!data?.has_more;

  // næste cursor (ældste i svaret)
  let nextCursor = null;
  if (items.length > 0) {
    const oldest = items[0]; // fordi vi returnerer ASC
    nextCursor = {
      before_time: oldest.piptime,
      before_id: oldest.idpips,
    };
  }

  return { items, nextCursor, hasMore };
}
