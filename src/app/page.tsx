'use client'

import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('copy')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<string>('')

  const [copyToken, setCopyToken] = useState('')
  const [copySourceId, setCopySourceId] = useState('')
  const [copyTargetId, setCopyTargetId] = useState('')
  const [copyOptions, setCopyOptions] = useState({
    settings: true,
    roles: true,
    channels: true,
    emojis: false,
    stickers: false
  })

  const [macroToken, setMacroToken] = useState('')
  const [macroChannelId, setMacroChannelId] = useState('')
  const [macroMessages, setMacroMessages] = useState('')
  const [macroDuration, setMacroDuration] = useState('60')
  const [macroSpeed, setMacroSpeed] = useState('0.5')

  const [nukerToken, setNukerToken] = useState('')
  const [nukerGuildId, setNukerGuildId] = useState('')
  const [nukerAction, setNukerAction] = useState<string | null>(null)

  const handleCopy = async () => {
    if (!copyToken || !copySourceId || !copyTargetId) {
      setStatus('error')
      setResult('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setIsLoading(true)
    setStatus('loading')
    try {
      const res = await fetch('/api/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: copyToken, sourceId: copySourceId, targetId: copyTargetId, options: copyOptions })
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      setResult(data.success ? JSON.stringify(data.stats, null, 2) : data.error)
    } catch { setStatus('error'); setResult('فشل الاتصال') }
    setIsLoading(false)
  }

  const handleMacro = async () => {
    if (!macroToken || !macroChannelId || !macroMessages) {
      setStatus('error')
      setResult('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setIsLoading(true)
    setStatus('loading')
    try {
      const res = await fetch('/api/macro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: macroToken, channelId: macroChannelId, messages: macroMessages.split('\n').filter(m => m.trim()), duration: parseFloat(macroDuration), speed: parseFloat(macroSpeed) })
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      setResult(data.success ? `Sent: ${data.sent} | Failed: ${data.failed}` : data.error)
    } catch { setStatus('error'); setResult('فشل الاتصال') }
    setIsLoading(false)
  }

  const handleNuker = async () => {
    if (!nukerToken || !nukerGuildId || !nukerAction) {
      setStatus('error')
      setResult('يرجى ملء جميع الحقول')
      return
    }
    setIsLoading(true)
    setStatus('loading')
    try {
      const res = await fetch('/api/nuker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: nukerToken, guildId: nukerGuildId, action: nukerAction })
      })
      const data = await res.json()
      setStatus(data.success ? 'success' : 'error')
      setResult(data.success ? JSON.stringify(data.stats, null, 2) : data.error)
    } catch { setStatus('error'); setResult('فشل الاتصال') }
    setIsLoading(false)
  }

  const nukerActions = [
    { id: 'nuke', label: 'نيكر كامل', desc: 'أدمن + تغيير اسم + حذف + إنشاء + سبام' },
    { id: 'banall', label: 'حظر الكل', desc: 'حظر جميع أعضاء السيرفر' },
    { id: 'delete_channels', label: 'حذف الرومات', desc: 'حذف جميع قنوات السيرفر' },
    { id: 'spam', label: 'سبام', desc: 'سبام في جميع القنوات' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir="rtl">
      <header className="border-b border-slate-800/50 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl">👑</div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">TRJ BOT</h1>
              <p className="text-sm text-slate-400">أدوات ديسكورد متقدمة</p>
            </div>
          </div>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>متصل
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">أدوات ديسكورد احترافية</h2>
          <p className="text-slate-400 mt-2">نسخ سيرفرات • نيوكر • ماكرو</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl">
          {[{ id: 'copy', label: '🖥️ نسخ سيرفر' }, { id: 'nuker', label: '💀 نيوكر' }, { id: 'macro', label: '⚡ ماكرو' }].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setStatus('idle'); setResult('') }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === t.id ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'copy' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">📋 نسخ سيرفر كامل</h3>
            <input type="password" placeholder="توكن حسابك" value={copyToken} onChange={e => setCopyToken(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none" />
            <div className="grid md:grid-cols-2 gap-4">
              <input placeholder="أيدي السيرفر المصدر" value={copySourceId} onChange={e => setCopySourceId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none" />
              <input placeholder="أيدي السيرفر الهدف" value={copyTargetId} onChange={e => setCopyTargetId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(copyOptions).map(([k, v]) => (
                <label key={k} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${v ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-slate-900/50 border-slate-600 text-slate-400'}`}>
                  <input type="checkbox" checked={v} onChange={e => setCopyOptions(p => ({ ...p, [k]: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-sm">{k === 'settings' ? 'إعدادات' : k === 'roles' ? 'رتب' : k === 'channels' ? 'رومات' : k === 'emojis' ? 'إيموجي' : 'ملصقات'}</span>
                </label>
              ))}
            </div>
            <button onClick={handleCopy} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg disabled:opacity-50">
              {isLoading ? '⏳ جاري...' : '⚡ بدء النسخ'}
            </button>
          </div>
        )}

        {activeTab === 'nuker' && (
          <div className="bg-slate-800/50 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">💀 أدوات النيوكر <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">خطر</span></h3>
            <input type="password" placeholder="توكن حسابك" value={nukerToken} onChange={e => setNukerToken(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none" />
            <input placeholder="أيدي السيرفر" value={nukerGuildId} onChange={e => setNukerGuildId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none" />
            <div className="grid md:grid-cols-2 gap-3">
              {nukerActions.map(a => (
                <div key={a.id} onClick={() => setNukerAction(a.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${nukerAction === a.id ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' : 'bg-slate-900/50 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                  <div className="font-semibold">{a.label}</div>
                  <div className={`text-sm ${nukerAction === a.id ? 'text-white/80' : 'text-slate-500'}`}>{a.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={handleNuker} disabled={isLoading || !nukerAction} className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg disabled:opacity-50">
              {isLoading ? '⏳ جاري...' : '🔥 تنفيذ'}
            </button>
          </div>
        )}

        {activeTab === 'macro' && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">⚡ ماكرو إرسال رسائل</h3>
            <input type="password" placeholder="توكن حسابك" value={macroToken} onChange={e => setMacroToken(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none" />
            <input placeholder="أيدي الروم" value={macroChannelId} onChange={e => setMacroChannelId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none" />
            <textarea placeholder="الرسائل (كل سطر رسالة)" value={macroMessages} onChange={e => setMacroMessages(e.target.value)} rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none resize-none" />
            <div className="grid md:grid-cols-2 gap-4">
              <input type="number" placeholder="المدة (ثواني)" value={macroDuration} onChange={e => setMacroDuration(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none" />
              <input type="number" step="0.1" placeholder="السرعة" value={macroSpeed} onChange={e => setMacroSpeed(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 outline-none" />
            </div>
            <button onClick={handleMacro} disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg disabled:opacity-50">
              {isLoading ? '⏳ جاري...' : '🚀 بدء الماكرو'}
            </button>
          </div>
        )}

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${status === 'success' ? 'bg-green-500/10 border border-green-500/30' : status === 'error' ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-700/50'}`}>
            <p className={`font-semibold mb-2 ${status === 'success' ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-white'}`}>
              {status === 'success' ? '✅ تم بنجاح!' : status === 'error' ? '❌ حدث خطأ' : 'النتيجة'}
            </p>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 mt-12 py-6 text-center text-slate-500">
        Dev By: <span className="text-red-400">Trj.py</span> | TRJ Bot © 2024
      </footer>
    </div>
  )
}
