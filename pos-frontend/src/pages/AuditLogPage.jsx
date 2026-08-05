import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  RiHistoryLine,
  RiFilter3Line,
  RiSearchLine,
  RiUser3Line,
  RiSettings4Line,
  RiDeleteBinLine,
  RiAddCircleLine,
  RiEditLine,
  RiArrowRightLine,
  RiLoginCircleLine,
  RiLogoutCircleLine,
  RiCloseCircleLine,
  RiErrorWarningLine
} from 'react-icons/ri'
import { auditLogAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Pagination from '../components/Pagination'
import { usePageSize } from '../hooks/usePageSize'
import MainLayout from '../components/MainLayout'

export default function AuditLogPage() {
  const { user, business } = useAuth()
  const bCode = business?.code
  const [pageSize, setPageSize] = usePageSize('auditlog', 50)
  const [filters, setFilters] = useState({
    action: '',
    actor_id: '',
    target_type: '',
    date_from: '',
    date_to: '',
    search: '',
    limit: pageSize,
    offset: 0
  })

  // Ensure only admin
  if (user?.role !== 'admin') {
    return (
      <MainLayout title="Riwayat Sistem" hideSidebar={false}>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <RiErrorWarningLine className="w-16 h-16 mb-4 text-red-400" />
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p>Hanya admin / owner yang dapat melihat Riwayat Sistem.</p>
        </div>
      </MainLayout>
    )
  }

  // Fetch filters options
  const { data: filterOptions } = useQuery({
    queryKey: ['auditFilters', bCode],
    queryFn: () => auditLogAPI.getFilters()
  })

  // Fetch logs
  const { data, isLoading } = useQuery({
    queryKey: ['auditLogs', bCode, filters],
    queryFn: () => auditLogAPI.getLogs(filters)
  })

  const currentPage = Math.floor(filters.offset / filters.limit) + 1
  const totalPages = Math.ceil((data?.total || 0) / filters.limit) || 1

  const handlePageChange = (page) => {
    setFilters(prev => ({...prev, offset: (page - 1) * prev.limit}))
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return <RiAddCircleLine className="text-emerald-500" />
      case 'UPDATE': return <RiEditLine className="text-blue-500" />
      case 'DELETE': return <RiDeleteBinLine className="text-red-500" />
      case 'LOGIN': return <RiLoginCircleLine className="text-emerald-500" />
      case 'LOGOUT': return <RiLogoutCircleLine className="text-gray-500" />
      case 'VOID': return <RiCloseCircleLine className="text-red-500" />
      case 'PASSWORD': return <RiSettings4Line className="text-amber-500" />
      default: return <RiHistoryLine className="text-gray-400" />
    }
  }

  const getActionBadge = (actionDisplay, actionCode) => {
    let color = 'bg-gray-100 text-gray-700 border-gray-200'
    if (actionCode === 'CREATE') color = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (actionCode === 'UPDATE') color = 'bg-blue-50 text-blue-700 border-blue-200'
    if (actionCode === 'DELETE' || actionCode === 'VOID') color = 'bg-red-50 text-red-700 border-red-200'
    
    return (
      <span className={`px-2.5 py-1 rounded-md border text-xs font-medium whitespace-nowrap flex items-center gap-1.5 w-fit ${color}`}>
        {getActionIcon(actionCode)}
        {actionDisplay}
      </span>
    )
  }

  return (
    <MainLayout title="Riwayat Sistem">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Sistem</h1>
          <p className="text-gray-500 text-sm mt-1">Lacak semua aktivitas dan perubahan data dalam bisnis Anda</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <RiFilter3Line className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Filter Pencarian</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipe Aksi</label>
              <select
                value={filters.action}
                onChange={e => setFilters({...filters, action: e.target.value, offset: 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Semua Aksi</option>
                {filterOptions?.actions?.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Pengguna</label>
              <select
                value={filters.actor_id}
                onChange={e => setFilters({...filters, actor_id: e.target.value, offset: 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Semua Pengguna</option>
                {filterOptions?.actors?.map(u => (
                  <option key={u.actor_id} value={u.actor_id}>{u.actor_name} ({u.actor_role})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Dari Tanggal</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={e => setFilters({...filters, date_from: e.target.value, offset: 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Sampai Tanggal</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={e => setFilters({...filters, date_to: e.target.value, offset: 0})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Cari Deskripsi</label>
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kata kunci..."
                  value={filters.search}
                  onChange={e => setFilters({...filters, search: e.target.value, offset: 0})}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setFilters({action:'', actor_id:'', target_type:'', date_from:'', date_to:'', search:'', limit:50, offset:0})}
              className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 mb-8 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
            </div>
          ) : data?.logs?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <RiHistoryLine className="w-12 h-12 mb-4 text-gray-300" />
              <p>Tidak ada riwayat aktivitas ditemukan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="px-5 py-4">Waktu</th>
                      <th className="px-5 py-4">Pengguna</th>
                      <th className="px-5 py-4">Aksi</th>
                      <th className="px-5 py-4">Target</th>
                      <th className="px-5 py-4 min-w-[300px]">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {data?.logs?.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                          {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                              {log.actor_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{log.actor_name}</div>
                              <div className="text-[11px] text-gray-500 capitalize">{log.actor_role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {getActionBadge(log.action_display, log.action)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[11px] font-semibold tracking-wide uppercase">
                            {log.target_type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-900">{log.description}</div>
                          
                          {/* Show detailed changes if any (JSON viewer) */}
                          {((log.old_data && Object.keys(log.old_data).length > 0) || 
                            (log.new_data && Object.keys(log.new_data).length > 0)) && (
                            <details className="mt-2 text-xs group">
                              <summary className="text-blue-600 cursor-pointer hover:underline font-medium list-none flex items-center gap-1">
                                <RiArrowRightLine className="transition-transform group-open:rotate-90" />
                                Detail Perubahan
                              </summary>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                                {log.old_data && (
                                  <div className="mb-2">
                                    <span className="text-red-500 font-semibold mb-1 block">Data Lama:</span>
                                    <pre className="text-gray-600">{JSON.stringify(log.old_data, null, 2)}</pre>
                                  </div>
                                )}
                                {log.new_data && (
                                  <div>
                                    <span className="text-emerald-500 font-semibold mb-1 block">Data Baru:</span>
                                    <pre className="text-gray-600">{JSON.stringify(log.new_data, null, 2)}</pre>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Box */}
              <div className="p-5 border-t border-gray-50 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 w-full md:w-1/3">
                  Menampilkan <span className="font-semibold text-gray-700">{data?.logs?.length === 0 ? 0 : filters.offset + 1}-{Math.min(filters.offset + filters.limit, data.total)}</span> dari <span className="font-semibold text-gray-700">{data.total}</span> riwayat
                </div>
                <div className="flex items-center justify-center w-full md:w-1/3">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
                <div className="w-full md:w-1/3 flex justify-end items-center gap-2 text-sm text-gray-500">
                  <span>Tampilkan</span>
                  <select value={filters.limit} onChange={e => {
                    const newLimit = Number(e.target.value)
                    setPageSize(newLimit)
                    setFilters({...filters, limit: newLimit, offset: 0})
                  }} className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 bg-gray-50 hover:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer font-medium appearance-none">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>baris</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
