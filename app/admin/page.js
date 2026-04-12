  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-6 pb-20 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none mb-2">Clowand Dashboard</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Global Logistics & Revenue Control</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="/" className="px-8 py-4 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
              <ExternalLink size={14} /> View Site
            </a>
            <button onClick={() => setIsLoggedIn(false)} className="px-8 py-4 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* 订单列表 */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                    <th className="px-12 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
