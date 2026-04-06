import { NextRequest, NextResponse } from 'next/server'

const DISCORD_API = 'https://discord.com/api/v10'

export async function POST(request: NextRequest) {
  try {
    const { token, channelId, messages, duration, speed } = await request.json()
    if (!token || !channelId || !messages?.length) return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 })

    let sent = 0, failed = 0
    const endTime = Date.now() + duration * 1000
    let idx = 0

    while (Date.now() < endTime) {
      const msg = messages[idx % messages.length]
      idx++
      try {
        const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Authorization': token, 'Content-Type': 'application/json', 'User-Agent': 'TRJ-Bot/1.0' },
          body: JSON.stringify({ content: msg })
        })
        if (res.ok) sent++
        else if (res.status === 429) {
          const data = await res.json().catch(() => ({}))
          await new Promise(r => setTimeout(r, ((data as {retry_after?: number}).retry_after || 1) * 1000))
          failed++
        } else failed++
      } catch { failed++ }
      await new Promise(r => setTimeout(r, speed * 1000))
    }

    return NextResponse.json({ success: true, sent, failed })
  } catch { return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 }) }
}
