import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Unlock, Search, Download, Users, Calendar, Mail, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Trash2, RefreshCw, ChevronsDown, ChevronsUp, Send, X, FileText } from 'lucide-react';
import { ADMIN_PASSWORD, EVENT_CONFIG } from '../constants';
import { getAllRSVPs, deleteRSVP, exportRSVPsAsCSV, downloadCSV, exportRSVPsAsPDF, downloadPDF, getStats, checkAdminSession, setAdminSession, syncFromGoogleSheets, deleteFromGoogleSheets } from '../utils/storage';
import { sendRSVPEmails } from '../utils/emailService';
import { ChristmasBackground } from './ChristmasBackground';

export const AdminView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAttendance, setFilterAttendance] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'submittedAt', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState({});
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isSendingInvites, setIsSendingInvites] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  // Check for admin access on mount and when URL params change
  useEffect(() => {
    const adminParam = searchParams.get('admin');
    const hasSession = checkAdminSession();
    console.log('[Admin] Auth check:', { adminParam, hasSession, authenticated });
    
    if (adminParam === 'true' || hasSession) {
      setAuthenticated(true);
      loadData();
    }
  }, [searchParams]);

  // Also check session on initial mount (in case searchParams doesn't trigger)
  useEffect(() => {
    if (!authenticated && checkAdminSession()) {
      console.log('[Admin] Session found on mount, authenticating');
      setAuthenticated(true);
      loadData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = () => {
    const data = getAllRSVPs();
    setRsvps(data);
    setStats(getStats());
  };

  // Auto-sync from Google Sheets on first load
  useEffect(() => {
    if (authenticated) {
      console.log('[Admin] Auto-syncing from Google Sheets on load...');
      syncFromGoogleSheets().then(result => {
        if (result.success) {
          console.log('[Admin] Auto-sync successful:', result);
          loadData();
        } else {
          console.log('[Admin] Auto-sync failed (non-blocking):', result.error);
        }
      });
    }
  }, [authenticated]);

  const handleSyncFromSheets = async () => {
    console.log('[Admin] Syncing from Google Sheets...');
    const result = await syncFromGoogleSheets();
    if (result.success) {
      loadData();
      alert(`Sync successful! ${result.synced} records from Google Sheets, ${result.count} total.`);
    } else {
      alert(`Sync failed: ${result.error}`);
    }
  };

  const handleSendInvites = async () => {
    console.log('[Admin] Send invitations clicked');
    const emails = inviteEmails.split(/[,;\n]/).map(e => e.trim()).filter(e => e && e.includes('@'));
    console.log('[Admin] Parsed emails:', emails);
    
    if (emails.length === 0) {
      alert('Please enter at least one valid email address (comma, semicolon, or newline separated)');
      return;
    }

    setIsSendingInvites(true);
    setInviteResult(null);

    try {
      const results = await Promise.all(
        emails.map(async (email, index) => {
          console.log(`[Admin] Sending invitation ${index + 1}/${emails.length} to:`, email);
          // Create a minimal RSVP data object for the invitation email
          const inviteData = {
            name: email.split('@')[0], // Use email prefix as placeholder
            email,
            phone: '',
            attendance: 'pending',
            partySize: 1,
            foodSelections: [],
            dietaryRestrictions: [],
            specialRequests: inviteMessage || `You're invited to the Mah Family Hawaiian Christmas 2026! Please RSVP using your invitation code: MAH-2026-EXCLUSIVE`,
            submittedAt: new Date().toISOString(),
            isInvitation: true
          };
          
          const result = await sendRSVPEmails(inviteData);
          console.log(`[Admin] Email result for ${email}:`, result);
          return result;
        })
      );

      console.log('[Admin] All results:', results);
      const sent = results.filter(r => r.guest?.success).length;
      const failed = results.filter(r => !r.guest?.success).length;
      
      setInviteResult({ sent, failed, total: emails.length });
      
      if (failed === 0) {
        alert(`Successfully sent ${sent} invitation(s)!`);
        setInviteEmails('');
        setInviteMessage('');
        setInviteModalOpen(false);
      } else {
        alert(`Sent ${sent}, failed ${failed}. Check console for details.`);
      }
    } catch (error) {
      console.error('[Admin] Failed to send invitations:', error);
      alert(`Failed to send invitations: ${error.message}. Check console for details.`);
    } finally {
      setIsSendingInvites(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('[Admin] Login attempt:', { password: password ? '***' : 'empty', expected: ADMIN_PASSWORD });
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
      setPassword('');
      setAdminSession(true);
      setSearchParams({ admin: 'true' }, { replace: true });
      loadData();
    } else {
      setPasswordError('Incorrect password. Please try again.');
      console.log('[Admin] Login failed - password mismatch');
    }
  };

  const handleLogout = () => {
    console.log('[Admin] Logging out');
    setAuthenticated(false);
    setAdminSession(false);
    setSearchParams({}, { replace: true });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this RSVP?')) {
      // Find the RSVP to get email for Google Sheets deletion
      const rsvp = rsvps.find(r => r.id === id);
      if (rsvp?.email) {
        deleteFromGoogleSheets(rsvp.email).then(result => {
          if (!result.success) {
            console.warn('[Admin] Google Sheets delete failed:', result.error);
          }
        });
      }
      deleteRSVP(id);
      loadData();
    }
  };

  const handleExport = () => {
    const csv = exportRSVPsAsCSV();
    if (csv) downloadCSV(csv);
    else alert('No RSVPs to export.');
  };

  const handleExportPDF = () => {
    const doc = exportRSVPsAsPDF();
    if (doc) downloadPDF(doc);
    else alert('No RSVPs to export.');
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    alert('Email copied!');
  };

  const filteredRsvps = rsvps
    .filter(rsvp => !searchQuery || rsvp.name.toLowerCase().includes(searchQuery.toLowerCase()) || rsvp.email.toLowerCase().includes(searchQuery.toLowerCase()) || (rsvp.phone||'').includes(searchQuery))
    .filter(rsvp => filterAttendance === 'all' || rsvp.attendance === filterAttendance)
    .sort((a, b) => {
      const av = a[sortConfig.key], bv = b[sortConfig.key];
      return (av < bv ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
    });

  const handleSort = (key) => setSortConfig(p => ({ key, direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc' }));
  const toggleRow = (id) => setExpandedRows(p => ({ ...p, [id]: !p[id] }));
  
  const expandAll = () => {
    const allExpanded = {};
    filteredRsvps.forEach(r => { allExpanded[r.id] = true; });
    setExpandedRows(allExpanded);
  };
  
  const collapseAll = () => {
    setExpandedRows({});
  };

  const getAttendanceIcon = (a) => a==='yes'?<CheckCircle className="w-5 h-5 text-green-400"/>:a==='maybe'?<AlertCircle className="w-5 h-5 text-yellow-400"/>:<XCircle className="w-5 h-5 text-red-400"/>;
  const getAttendanceLabel = (a) => a==='yes'?'Attending':a==='maybe'?'Maybe':'Not Attending';

  if (!authenticated) {
    return (
<section id="admin" className="relative min-h-screen pt-16 pb-20 flex items-center justify-center">
        <ChristmasBackground showSnow={true} showOrnaments={true} />
        <div className="relative z-10 max-w-md w-full mx-auto px-4">
          <div className="card text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
              <Lock className="w-10 h-10 text-xmas-gold" />
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-xmas-gold to-transparent" />
            </div>
            <h1 className="font-display text-3xl font-bold text-xmas-cream mb-2">Admin Access</h1>
            <p className="text-xmas-cream/70 mb-8">Enter the admin password to view RSVPs</p>
            <form onSubmit={handleLogin} className="space-y-4">
              {passwordError && <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">{passwordError}</div>}
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-xmas-cream/40" /><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter admin password" className="input-field pl-12" autoFocus /></div>
              <button type="submit" className="btn-gold w-full"><Unlock className="w-5 h-5 mr-2" /> Access Dashboard</button>
            </form>
            <Link to="/" className="text-xmas-gold hover:underline mt-6 inline-block">Back to Home</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
<section id="admin" className="relative min-h-screen pt-16 pb-20">
      <ChristmasBackground showSnow={false} showOrnaments={true} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div><h1 className="font-display text-3xl font-bold text-xmas-cream">Admin Dashboard</h1><p className="text-xmas-cream/70">Christmas 2026 Celebration - RSVP Management</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => setInviteModalOpen(true)} className="btn-gold p-3" title="Send Invitations"><Send className="w-5 h-5" /></button><button onClick={handleSyncFromSheets} className="btn-secondary p-3" title="Sync from Sheets"><RefreshCw className="w-5 h-5" /></button><button onClick={handleExport} className="btn-secondary p-3" title="Export CSV"><Download className="w-5 h-5" /></button><button onClick={handleExportPDF} className="btn-secondary p-3" title="Export PDF"><FileText className="w-5 h-5" /></button><button onClick={handleLogout} className="btn-primary p-3" title="Logout"><Lock className="w-5 h-5" /></button></div>
        </div>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"><StatCard icon={<Users className="w-6 h-6" />} label="Total Responses" value={stats?.totalResponses||0} color="xmas-gold" /><StatCard icon={<CheckCircle className="w-6 h-6" />} label="Attending" value={stats?.attending||0} color="green" /><StatCard icon={<AlertCircle className="w-6 h-6" />} label="Maybe" value={stats?.maybe||0} color="yellow" /><StatCard icon={<XCircle className="w-6 h-6" />} label="Not Attending" value={stats?.notAttending||0} color="red" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"><StatCard icon={<Users className="w-6 h-6" />} label="Confirmed Guests" value={stats?.totalConfirmedGuests||0} color="xmas-green" /><StatCard icon={<AlertCircle className="w-6 h-6" />} label="Potential Guests" value={stats?.potentialGuests||0} color="xmas-gold" /><StatCard icon={<Calendar className="w-6 h-6" />} label="Max Capacity" value={EVENT_CONFIG.maxGuests} color="xmas-red" /><StatCard icon={<Mail className="w-6 h-6" />} label="RSVP Deadline" value={EVENT_CONFIG.rsvpDeadline.split(",")[0]} color="xmas-gold" /></div>
        <div className="card p-4 mb-6"><div className="flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-xmas-cream/40" /><input type="text" placeholder="Search by name, email, or phone..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="input-field pl-12" /></div><select value={filterAttendance} onChange={e=>setFilterAttendance(e.target.value)} className="input-field appearance-none w-auto"><option value="all">All Attendance</option><option value="yes">Attending</option><option value="maybe">Maybe</option><option value="no">Not Attending</option></select><div className="flex gap-2"><button onClick={expandAll} className="btn-secondary text-sm"><ChevronsDown className="w-4 h-4 mr-1" /> Expand All</button><button onClick={collapseAll} className="btn-secondary text-sm"><ChevronsUp className="w-4 h-4 mr-1" /> Collapse All</button></div></div></div>
        <div className="card overflow-hidden">
{filteredRsvps.length===0?(<div className="p-12 text-center"><Users className="w-16 h-16 mx-auto text-xmas-cream/30 mb-4" /><h3 className="font-display text-xl text-xmas-cream mb-2">No RSVPs Found</h3><p className="text-xmas-cream/60">{searchQuery||filterAttendance!=="all"?"Try adjusting your search or filter.":"No one has RSVP'd yet."}</p></div>):(<div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-xmas-darkred/30 bg-xmas-darkred/20"><th className="p-3 text-left text-xs font-semibold text-xmas-gold uppercase tracking-wider cursor-pointer hover:bg-xmas-darkred/30" onClick={()=>handleSort("name")}>Guest <ChevronDown className="w-4 h-4 inline" /></th><th className="p-3 text-left text-xs font-semibold text-xmas-gold uppercase tracking-wider cursor-pointer hover:bg-xmas-darkred/30" onClick={()=>handleSort("attendance")}>Status <ChevronDown className="w-4 h-4 inline" /></th><th className="p-3 text-left text-xs font-semibold text-xmas-gold uppercase tracking-wider cursor-pointer hover:bg-xmas-darkred/30" onClick={()=>handleSort("partySize")}>Party <ChevronDown className="w-4 h-4 inline" /></th><th className="p-3 text-left text-xs font-semibold text-xmas-gold uppercase tracking-wider cursor-pointer hover:bg-xmas-darkred/30" onClick={()=>handleSort("submittedAt")}>Submitted <ChevronDown className="w-4 h-4 inline" /></th><th className="p-3 text-right text-xs font-semibold text-xmas-gold uppercase tracking-wider">Actions</th></tr></thead><tbody className="divide-y divide-xmas-darkred/20">{filteredRsvps.map((rsvp)=><React.Fragment key={rsvp.id}><tr className="hover:bg-xmas-darkred/20 transition-colors" onClick={()=>toggleRow(rsvp.id)}><td className="p-3"><div className="font-medium text-xmas-cream">{rsvp.name}</div><div className="flex items-center space-x-3 text-sm text-xmas-cream/60"><span onClick={e=>{e.stopPropagation();handleCopyEmail(rsvp.email);}} className="cursor-pointer hover:text-xmas-gold flex items-center space-x-1"><Mail className="w-3 h-3" />{rsvp.email}</span>{rsvp.phone&&<span className="flex items-center space-x-1"><span>{rsvp.phone}</span></span>}</div></td><td className="p-3"><div className="flex items-center space-x-2">{getAttendanceIcon(rsvp.attendance)}<span className="text-sm font-medium text-xmas-cream">{getAttendanceLabel(rsvp.attendance)}</span></div></td><td className="p-3"><span className="text-xmas-cream">{rsvp.partySize} guest{rsvp.partySize!==1?"s":""}</span></td><td className="p-3 text-sm text-xmas-cream/70">{new Date(rsvp.submittedAt).toLocaleDateString()}</td><td className="p-3 text-right"><button onClick={e=>{e.stopPropagation();toggleRow(rsvp.id);}} className="p-2 text-xmas-cream/50 hover:text-xmas-gold transition-colors" aria-label={expandedRows[rsvp.id]?"Collapse":"Expand"}>{expandedRows[rsvp.id]?<ChevronUp className="w-5 h-5" />:<ChevronDown className="w-5 h-5" />}</button></td></tr>{expandedRows[rsvp.id]&&<tr><td colSpan={5} className="p-0"><div className="bg-xmas-night/50 p-6 border-t border-xmas-darkred/20 animate-fade-in"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><DetailItem label="Food Selections" value={rsvp.foodSelections.length>0?rsvp.foodSelections.map(f=>f.name+" (serves "+f.serves+") ["+f.category+"]").join(", "):"None"} /><DetailItem label="Dietary Restrictions" value={rsvp.dietaryRestrictions.length>0?rsvp.dietaryRestrictions.join(", "):"None"} /><DetailItem label="Special Requests" value={rsvp.specialRequests||"None"} /></div><div className="mt-4 flex justify-end"><button onClick={e=>{e.stopPropagation();handleDelete(rsvp.id);}} className="btn-primary text-sm px-4 py-2"><Trash2 className="w-4 h-4 mr-1" /> Delete RSVP</button></div></div></td></tr>}</React.Fragment>)}</tbody></table></div>)}</div>
      </div>
    </section>
    );

    // Invitation Modal
    const InviteModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setInviteModalOpen(false)}>
        <div className="bg-xmas-night border border-xmas-darkred/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-xmas-darkred/30">
            <h2 className="font-display text-xl text-xmas-gold">Send Invitations</h2>
            <button onClick={() => setInviteModalOpen(false)} className="text-xmas-cream/60 hover:text-xmas-gold transition-colors p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="label block mb-2">Email Addresses (comma-separated)</label>
              <textarea
                className="input-field min-h-[100px] resize-y"
                value={inviteEmails}
                onChange={e => setInviteEmails(e.target.value)}
                placeholder="guest1@email.com, guest2@email.com, guest3@email.com"
              />
              <p className="text-xs text-xmas-cream/50 mt-1">Enter one email per line or comma-separated</p>
            </div>
            <div>
              <label className="label block mb-2">Custom Message (optional)</label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                placeholder="Optional personal message to include in the invitation..."
              />
            </div>
            {inviteResult && (
              <div className={`p-3 rounded-lg ${inviteResult.failed === 0 ? 'bg-green-900/30 border border-green-500/50' : 'bg-yellow-900/30 border border-yellow-500/50'}`}>
                <p className="text-sm">Sent: <span className="font-bold text-green-400">{inviteResult.sent}</span> / Failed: <span className="font-bold text-red-400">{inviteResult.failed}</span> / Total: {inviteResult.total}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setInviteModalOpen(false)} className="btn-secondary" disabled={isSendingInvites}>
                Cancel
              </button>
              <button onClick={handleSendInvites} className="btn-gold" disabled={isSendingInvites}>
                {isSendingInvites ? 'Sending...' : 'Send Invitations'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <>
        {inviteModalOpen && <InviteModal />}
      </>
    );
  };

const StatCard=({icon,label,value,color})=><div className="card text-center"><div className={"text-3xl mb-2 "+(color=="xmas-gold"?"text-xmas-gold":color=="green"?"text-green-400":color=="yellow"?"text-yellow-400":color=="red"?"text-red-400":color=="xmas-green"?"text-xmas-green":color=="xmas-red"?"text-xmas-red":"")}>{icon}</div><div className="font-display text-3xl font-bold text-xmas-cream">{value}</div><div className="text-sm text-xmas-cream/60">{label}</div></div>;
const DetailItem=({label,value})=><div><div className="text-xs text-xmas-cream/50 uppercase tracking-wider mb-1">{label}</div><div className="text-sm text-xmas-cream whitespace-pre-wrap">{value}</div></div>;