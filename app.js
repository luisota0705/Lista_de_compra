import { supabase } from './supabaseClient.js'

// =============================================
// REFERÊNCIAS DO DOM
// =============================================
const lista = document.getElementById('lista')
const input = document.getElementById('item')
const emptyStateElement = document.getElementById('empty-state')

console.log('🔵 App iniciado - Elementos DOM:', { lista, input, emptyStateElement })

// =============================================
// FUNÇÕES AUXILIARES DE UI
// =============================================

function verificarEstadoVazio() {
    const itens = document.querySelectorAll('.item-compra')
    console.log(`📊 Total de itens: ${itens.length}`)
    
    if (itens.length === 0) {
        if (emptyStateElement) emptyStateElement.style.display = 'flex'
        if (lista) lista.style.display = 'none'
    } else {
        if (emptyStateElement) emptyStateElement.style.display = 'none'
        if (lista) lista.style.display = 'flex'
    }
}

window.toggleCheck = function (elemento) {
    elemento.classList.toggle('checked')
    const itemInfo = elemento.closest('.item-info')
    const textoSpan = itemInfo.querySelector('.item-texto')
    textoSpan.classList.toggle('riscado')
}

// =============================================
// AUTENTICAÇÃO
// =============================================

async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
        console.error('❌ Erro ao obter usuário:', error)
        return null
    }
    
    if (!user) {
        console.warn('⚠️ Usuário não autenticado - Redirecionando')
        window.location.href = 'login.html'
        return null
    }
    
    console.log('✅ Usuário autenticado:', user.id)
    return user
}

window.logout = async function () {
    await supabase.auth.signOut()
    window.location.href = 'login.html'
}

// =============================================
// CRUD DA LISTA DE COMPRAS (SUPABASE)
// =============================================

async function carregarLista() {
    console.log('📥 Carregando lista...')
    
    const { data, error } = await supabase
        .from('lista_compras')
        .select('*')
        .order('id', { ascending: true }) // ✅ CORRIGIDO: usando 'id' em vez de 'created_at'

    if (error) {
        console.error('❌ Erro ao carregar:', error)
        alert('Erro ao carregar lista: ' + error.message)
        return
    }

    console.log(`✅ ${data.length} itens carregados:`, data)

    lista.innerHTML = ''

    data.forEach((item) => {
        console.log(`🛒 Renderizando: ${item.item}`)
        
        const li = document.createElement('li')
        li.className = 'item-compra'
        li.style.animation = 'slideIn 0.3s ease'
        
        li.innerHTML = `
            <div class="item-info">
                <div class="item-check" onclick="toggleCheck(this)">
                    <i class="fas fa-check"></i>
                </div>
                <span class="item-texto">${escapeHtml(item.item)}</span>
            </div>
            <button class="btn-delete" onclick="removerItem('${item.id}')" title="Remover item">
                <i class="fas fa-trash-alt"></i>
            </button>
        `
        lista.appendChild(li)
    })

    verificarEstadoVazio()
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

window.adicionarItem = async function () {
    console.log('➕ Adicionar item...')
    
    const texto = input.value.trim()
    
    if (texto === '') {
        console.warn('⚠️ Texto vazio')
        input.style.backgroundColor = '#FEF2F2'
        setTimeout(() => input.style.backgroundColor = '', 300)
        return
    }

    const user = await getUser()
    if (!user) {
        console.error('❌ Sem usuário')
        return
    }

    console.log('📤 Inserindo:', { item: texto, adicionado_por: user.id })

    const { data, error } = await supabase
        .from('lista_compras')
        .insert({
            item: texto,
            adicionado_por: user.id
        })
        .select()

    if (error) {
        console.error('❌ Erro ao adicionar:', error)
        alert('Erro ao adicionar: ' + error.message)
        return
    }

    console.log('✅ Item adicionado:', data)
    
    input.value = ''
    input.focus()
    await carregarLista()
}

window.removerItem = async function (id) {
    console.log(`🗑️ Removendo ID: ${id}`)
    
    const itemParaRemover = document.querySelector(`[onclick="removerItem('${id}')"]`)?.closest('.item-compra')
    
    if (itemParaRemover) {
        itemParaRemover.style.opacity = '0'
        itemParaRemover.style.transform = 'translateX(20px)'
        await new Promise(resolve => setTimeout(resolve, 150))
    }

    const { error } = await supabase
        .from('lista_compras')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('❌ Erro ao remover:', error)
        alert('Erro ao remover: ' + error.message)
        return
    }

    console.log('✅ Item removido')
    await carregarLista()
}

// =============================================
// INICIALIZAÇÃO
// =============================================

console.log('🚀 Inicializando...')

getUser().then((user) => {
    if (user) {
        console.log('👤 Carregando lista para usuário:', user.id)
        carregarLista()
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                adicionarItem()
            }
        })
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement === input) {
        e.preventDefault()
        adicionarItem()
    }
})