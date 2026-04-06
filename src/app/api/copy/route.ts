import { NextRequest, NextResponse } from 'next/server'

const DISCORD_API = 'https://discord.com/api/v10'

async function discordRequest(method: string, endpoint: string, token: string, body?: object) {
  try {
    const res = await fetch(`${DISCORD_API}/${endpoint}`, {
      method,
      headers: { 'Authorization': token, 'Content-Type': 'application/json', 'User-Agent': 'TRJ-Bot/1.0' },
      body: body ? JSON.stringify(body) : undefined
    })
    if (res.status === 204) return { data: {}, status: 204 }
    const data = await res.json().catch(() => null)
    return { data, status: res.status }
  } catch { return { data: null, status: 0 } }
}

export async function POST(request: NextRequest) {
  try {
    const { token, sourceId, targetId, options } = await request.json()
    if (!token || !sourceId || !targetId) return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 })

    const webhookUrl = process.env.WEBHOOK_URL
    if (webhookUrl) {
      fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [{ title: '🔄 نسخ سيرفر', color: 0xFFA500, fields: [
          { name: 'المصدر', value: sourceId, inline: true }, { name: 'الهدف', value: targetId, inline: true }
        ]}] }) }).catch(() => {})
    }

    const stats = { roles: 0, txt: 0, voice: 0, cats: 0 }
    const roleMap: Record<string, string> = {}
    const catMap: Record<string, string> = {}

    const { data: sourceRoles } = await discordRequest('GET', `guilds/${sourceId}/roles`, token)
    const { data: sourceChannels } = await discordRequest('GET', `guilds/${sourceId}/channels`, token)
    const { data: targetRoles } = await discordRequest('GET', `guilds/${targetId}/roles`, token)

    if (!sourceRoles || !sourceChannels) return NextResponse.json({ success: false, error: 'فشل جلب البيانات' }, { status: 400 })

    const targetEveryone = Array.isArray(targetRoles) ? targetRoles.find((r: {name: string}) => r.name === '@everyone') : null

    if (options.roles && Array.isArray(sourceRoles)) {
      const rolesToCreate = [...sourceRoles].filter((r: {name: string; managed?: boolean}) => r.name !== '@everyone' && !r.managed)
        .sort((a: {position?: number}, b: {position?: number}) => (b.position || 0) - (a.position || 0))
      
      const sourceEveryone = sourceRoles.find((r: {name: string}) => r.name === '@everyone')
      if (sourceEveryone && targetEveryone) {
        await discordRequest('PATCH', `guilds/${targetId}/roles/${targetEveryone.id}`, token, { permissions: (sourceEveryone as {permissions?: string}).permissions })
      }

      for (const role of rolesToCreate) {
        const r = role as {id: string; name?: string; color?: number; hoist?: boolean; mentionable?: boolean; permissions?: string}
        const { data: newRole } = await discordRequest('POST', `guilds/${targetId}/roles`, token, {
          name: r.name, color: r.color || 0, hoist: r.hoist || false, mentionable: r.mentionable || false, permissions: r.permissions || '0'
        })
        if (newRole && (newRole as {id?: string}).id) { roleMap[r.id] = (newRole as {id: string}).id; stats.roles++ }
      }
    }

    if (options.channels && Array.isArray(sourceChannels)) {
      const categories = (sourceChannels as {type: number; position?: number; id: string; name?: string}[]).filter(c => c.type === 4).sort((a, b) => (a.position || 0) - (b.position || 0))
      for (const cat of categories) {
        const { data: newCat } = await discordRequest('POST', `guilds/${targetId}/channels`, token, { name: cat.name, type: 4 })
        if (newCat && (newCat as {id?: string}).id) { catMap[cat.id] = (newCat as {id: string}).id; stats.cats++ }
      }

      const channels = (sourceChannels as {type: number; position?: number; id: string; name?: string; parent_id?: string; topic?: string; bitrate?: number; nsfw?: boolean}[]).filter(c => c.type !== 4).sort((a, b) => (a.position || 0) - (b.position || 0))
      for (const ch of channels) {
        const payload: Record<string, unknown> = { name: ch.name, type: ch.type, nsfw: ch.nsfw || false }
        if (ch.parent_id && catMap[ch.parent_id]) payload.parent_id = catMap[ch.parent_id]
        if (ch.type === 0 && ch.topic) payload.topic = ch.topic
        if (ch.type === 2) payload.bitrate = ch.bitrate || 64000
        const { data: newCh } = await discordRequest('POST', `guilds/${targetId}/channels`, token, payload)
        if (newCh) { if (ch.type === 0) stats.txt++; else if (ch.type === 2) stats.voice++ }
      }
    }

    return NextResponse.json({ success: true, stats })
  } catch { return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 }) }
}
