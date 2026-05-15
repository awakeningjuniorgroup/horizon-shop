import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { 
    Users, Store, Truck, Search, ShieldBan, Key, Trash2, 
    CheckCircle, X, Shield, Activity, AlertTriangle, Mail, Calendar, Info, UserCog
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SuperUserManage = () => {
    const { axios } = useAppContext();
    const [roleTab, setRoleTab] = useState('user'); // user | seller | rider
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Actions State
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPass, setNewPass] = useState("");
    const [newRole, setNewRole] = useState("user");
    
    // Modal States
    const [showPassModal, setShowPassModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/user/admin/users?role=${roleTab}`);
            if (data.success) setUsers(data.users);
        } catch (error) { 
            toast.error("Failed to sync user ledger"); 
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (id, isBlocked) => {
        if(!window.confirm(`Are you sure you want to ${isBlocked ? 'RESTORE' : 'SUSPEND'} this account?`)) return;
        try {
            const { data } = await axios.post('/api/user/admin/block', { userId: id });
            if (data.success) { 
                toast.success(data.message); 
                fetchUsers(); 
            }
        } catch (error) { toast.error("Action failed"); }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("CRITICAL WARNING: This will permanently delete this user from the Database AND Clerk Auth. Proceed?")) return;
        try {
            const { data } = await axios.post('/api/user/admin/delete', { id });
            if (data.success) { 
                toast.success("Account permanently removed"); 
                fetchUsers(); 
            }
        } catch (error) { toast.error("Deletion failed"); }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if(newPass.length < 8) return toast.error("Password must be at least 8 characters");
        
        const loadToast = toast.loading("Updating security credentials via Clerk...");
        try {
            const { data } = await axios.post('/api/user/admin/reset-password', { userId: selectedUser._id, newPassword: newPass });
            if (data.success) { 
                toast.success("Security credentials updated", { id: loadToast }); 
                setShowPassModal(false); 
                setNewPass(""); 
                setSelectedUser(null);
            } else {
                toast.error(data.message, { id: loadToast });
            }
        } catch (error) { toast.error("Update failed", { id: loadToast }); }
    };

    const handleRoleChange = async (e) => {
        e.preventDefault();
        if (newRole === selectedUser.role) return toast.error("User already has this role.");
        
        const loadToast = toast.loading(`Updating access level to ${newRole.toUpperCase()}...`);
        try {
            const payload = { 
                userId: selectedUser._id, 
                role: newRole, 
                newRole: newRole 
            };

            const { data } = await axios.post('/api/user/admin/update', payload);

            if (data.success) { 
                toast.success(`Access level updated to ${newRole.toUpperCase()}`, { id: loadToast }); 
                setShowRoleModal(false); 
                setSelectedUser(null);
                fetchUsers(); 
            } else {
                toast.error(data.message, { id: loadToast });
            }
        } catch (error) { 
            console.error(error);
            toast.error("Role update failed", { id: loadToast }); 
        }
    };

    useEffect(() => { fetchUsers(); }, [roleTab]);

    const filtered = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = users.filter(u => !u.isBlocked).length;
    const bannedCount = users.filter(u => u.isBlocked).length;

    return (
        // 🟢 CRITICAL FIX: Changed from max-w to w-full min-w-0 to prevent layout blowouts
        <div className="space-y-6 pb-12 w-full min-w-0">
            
            {/* 🟢 HEADER & METRICS */}
            {/* 🟢 CRITICAL FIX: Removed sticky top to prevent clashing with SuperLayout topbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-slate-200/60 w-full">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Users size={24} className="text-indigo-600"/> Network User Management
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-widest">Review, promote, and enforce security policies</p>
                </div>
                
                <div className="flex flex-col xl:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Role Tabs */}
                    <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full xl:w-auto overflow-x-auto custom-scrollbar shadow-sm shrink-0">
                        {['user', 'seller', 'rider'].map(r => (
                            <button 
                                key={r} onClick={() => { setRoleTab(r); setSearch(''); }} 
                                className={`whitespace-nowrap flex-1 xl:flex-none capitalize px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${roleTab === r ? 'bg-white text-indigo-700 shadow border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {r}s
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 px-6 py-2.5 rounded-xl flex justify-between gap-6 w-full xl:w-auto shadow-sm shrink-0">
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p><p className="text-base font-black text-slate-800">{users.length}</p></div>
                        <div className="w-px bg-slate-200"></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</p><p className="text-base font-black text-emerald-600">{activeCount}</p></div>
                        <div className="w-px bg-slate-200"></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suspended</p><p className="text-base font-black text-rose-600">{bannedCount}</p></div>
                    </div>
                </div>
            </div>

            {/* 🟢 INFO BANNER */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start sm:items-center gap-3 text-blue-800 text-xs font-medium shadow-sm w-full">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5 sm:mt-0"/>
                <p className="leading-relaxed"><strong>Clerk Auth Sync Active:</strong> New users must register via the public portal. Use the <b className="text-blue-900 font-bold">Modify Access Level</b> action to promote existing users to Sellers, Riders, or Admins.</p>
            </div>

            {/* 🟢 SEARCH BAR */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={`Search ${roleTab}s by name or email address...`} 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium text-slate-800"
                />
            </div>

            {/* 🟢 ENTERPRISE DATA TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden w-full">
                {/* 🟢 CRITICAL FIX: custom-scrollbar on the table wrapper forces internal scrolling */}
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                            <tr>
                                <th className="p-5">Identity Record</th>
                                <th className="p-5">Role-Specific Data</th>
                                <th className="p-5">Security Status</th>
                                <th className="p-5">System Onboard</th>
                                <th className="p-5 text-center">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing database records...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No {roleTab} records found matching your criteria.</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-black text-sm shrink-0
                                                ${roleTab === 'seller' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                                                  roleTab === 'rider' ? 'bg-sky-50 border-sky-200 text-sky-700' : 
                                                  'bg-slate-100 border-slate-200 text-slate-700'}`}
                                            >
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-bold text-sm">{u.name}</p>
                                                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={10}/> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="p-5 align-middle">
                                        {u.role === 'seller' && (
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Store size={14} className="text-amber-500"/> {u.shopName || 'Not Set'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registered Store</p>
                                            </div>
                                        )}
                                        {u.role === 'rider' && (
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><Truck size={14} className="text-sky-500"/> {u.vehicleNumber || 'Not Set'}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Assigned Vehicle</p>
                                            </div>
                                        )}
                                        {u.role === 'user' && (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md">Standard Consumer</span>
                                        )}
                                    </td>

                                    <td className="p-5 align-middle">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider ${u.isBlocked ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                                            {u.isBlocked ? <AlertTriangle size={10}/> : <Activity size={10}/>}
                                            {u.isBlocked ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>

                                    <td className="p-5 align-middle">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                                            <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider"><Calendar size={10}/> Joined</span>
                                        </div>
                                    </td>

                                    <td className="p-5 text-right align-middle">
                                        {/* 🟢 CRITICAL FIX: Removed opacity-0 hide, so mobile users can always see action buttons without hovering */}
                                        <div className="flex items-center justify-center gap-2 transition-opacity">
                                            <button 
                                                onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }} 
                                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg transition-colors shadow-sm active:scale-95" 
                                                title="Modify Access Level"
                                            >
                                                <UserCog size={16}/>
                                            </button>

                                            <button 
                                                onClick={() => { setSelectedUser(u); setShowPassModal(true); }} 
                                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm active:scale-95" 
                                                title="Force Credentials Reset"
                                            >
                                                <Key size={16}/>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleBan(u._id, u.isBlocked)} 
                                                className={`p-2 bg-white border border-slate-200 rounded-lg transition-colors shadow-sm active:scale-95 ${u.isBlocked ? 'text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50' : 'text-orange-500 hover:border-orange-200 hover:bg-orange-50'}`}
                                                title={u.isBlocked ? "Restore Access" : "Suspend Access"}
                                            >
                                                <ShieldBan size={16}/>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(u._id)} 
                                                className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-sm active:scale-95" 
                                                title="Terminate Database Record"
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==========================================
                🟢 ROLE MODIFICATION MODAL
                ========================================== */}
            <AnimatePresence>
                {showRoleModal && selectedUser && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2"><UserCog size={16} className="text-blue-600"/> Modify Access Level</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">Target: {selectedUser?.email}</p>
                                </div>
                                <button onClick={() => setShowRoleModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"><X size={16}/></button>
                            </div>
                            
                            <form onSubmit={handleRoleChange} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Select System Role</label>
                                    <div className="space-y-2.5">
                                        {['user', 'seller', 'rider', 'admin'].map(r => (
                                            <label key={r} className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all shadow-sm ${newRole === r ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="roleGroup" 
                                                    value={r} 
                                                    checked={newRole === r} 
                                                    onChange={() => setNewRole(r)} 
                                                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                                />
                                                <span className={`text-sm font-bold capitalize ${newRole === r ? 'text-blue-900' : 'text-slate-700'}`}>{r}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {newRole === 'admin' && (
                                        <p className="text-[10px] font-bold text-rose-500 mt-4 flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100"><AlertTriangle size={14} className="shrink-0"/> Warning: Grants administrative system access.</p>
                                    )}
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2">Authorize Role Transfer</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ==========================================
                🟢 RESET PASSWORD MODAL
                ========================================== */}
            <AnimatePresence>
                {showPassModal && selectedUser && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-amber-50 p-5 border-b border-amber-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2"><Key size={16} className="text-amber-600"/> Security Override</h3>
                                    <p className="text-[10px] text-amber-600 uppercase tracking-widest mt-1 font-bold">Target: {selectedUser?.email}</p>
                                </div>
                                <button onClick={() => setShowPassModal(false)} className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-md transition-colors"><X size={16}/></button>
                            </div>
                            
                            <form onSubmit={handlePasswordReset} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Access Key</label>
                                    <input 
                                        required 
                                        placeholder="Minimum 8 characters required" 
                                        type="text" 
                                        className="w-full bg-white border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm font-bold text-slate-800 shadow-sm transition-shadow" 
                                        value={newPass} 
                                        onChange={e => setNewPass(e.target.value)} 
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed">This will instantly overwrite the user's password in the central Clerk Authentication database and terminate active sessions.</p>
                                </div>
                                <button type="submit" className="w-full bg-amber-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"><Shield size={16}/> Force Credentials Reset</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SuperUserManage;