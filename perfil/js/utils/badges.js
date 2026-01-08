const ROLE_CONFIG = {
    'admin_master': { icon: 'fa-solid fa-circle-check', class: 'badge-dev', color: '#764ba2', title: 'Admin Master' },
    'nutri': { icon: 'fa-solid fa-user-doctor', class: 'badge-nutri', color: '#28a745', title: 'Nutricionista' },
    'verified': { icon: 'fa-solid fa-circle-check', class: 'badge-user', color: '#1da1f2', title: 'Verificado' }
};

export function getRoleBadgeHTML(user) {
    let role = user.role || user.authorRole;
    
    // Regra hardcoded para compatibilidade
    if (!role && (user.realname?.includes('Tarx') || user.username === 'tarxdev')) role = 'admin_master';
    
    const config = ROLE_CONFIG[role] || (role === 'admin' ? ROLE_CONFIG['admin_master'] : null);
    
    if (!config) return '';
    return `<i class="${config.icon} ${config.class}" style="color:${config.color}; margin-left:5px;" title="${config.title}"></i>`;
}