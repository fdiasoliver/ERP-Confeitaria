"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { FilterChips } from "@/components/admin/shared/FilterChips";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { useViewMode } from "@/hooks/useViewMode";
import type { ValidationError } from "@/lib/types";
import * as userApi from "@/lib/api/userApi";
import { ApiRequestError, USER_ROLE_LABELS, type User, type UserRole, type UserCreateInput } from "@/lib/api/userApi";

// ── Local types ────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const EMPTY_FORM: UserForm = { name: "", email: "", password: "", role: "ATENDIMENTO" };

type StatusFilter = "all" | "active" | "inactive";
type RoleFilter = "all" | UserRole;

const PAGE_SIZE = 12;

// ── Main page ──────────────────────────────────────────────────────────────────

export default function UsuariosAdminPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("usuarios");

  const [modal, setModal] = useState<ModalMode | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadUsers(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await userApi.listUsersPaged({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        role: roleFilter === "all" ? undefined : roleFilter,
        orderBy: "name",
        orderDirection: "asc",
      });
      setUsers(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de usuários.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, statusFilter, roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || statusFilter !== "all" || roleFilter !== "all";

  function handleStatusFilterChange(value: StatusFilter) { setStatusFilter(value); setPage(1); }
  function handleRoleFilterChange(value: RoleFilter) { setRoleFilter(value); setPage(1); }

  // ── Formulário de criar/editar ─────────────────────────────────────────────

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditing(null);
    setModal("create");
  }

  function openEdit(user: User) {
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormErrors({});
    setEditing(user);
    setModal("edit");
  }

  function closeModal() { setModal(null); setEditing(null); setFormErrors({}); }

  function setField<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";
    else if (name.length < 2) errs.name = "Mínimo 2 caracteres.";
    else if (name.length > 100) errs.name = "Máximo 100 caracteres.";

    const email = form.email.trim();
    if (!email) errs.email = "E-mail é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "E-mail inválido.";

    if (modal === "create") {
      if (!form.password) errs.password = "Senha é obrigatória.";
      else if (form.password.length < 8) errs.password = "Senha deve ter pelo menos 8 caracteres.";
    } else if (form.password && form.password.length < 8) {
      errs.password = "Senha deve ter pelo menos 8 caracteres.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function applyServerValidationErrors(details: unknown) {
    if (!Array.isArray(details)) return false;
    const errs: Record<string, string> = {};
    (details as ValidationError[]).forEach((e) => { errs[e.field] = e.message; });
    if (Object.keys(errs).length === 0) return false;
    setFormErrors(errs);
    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    const toastId = toast.loading(modal === "create" ? "Criando usuário…" : "Salvando alterações…");
    try {
      if (modal === "create") {
        const payload: UserCreateInput = { name: form.name, email: form.email, password: form.password, role: form.role };
        await userApi.createUser(payload);
        toast.success("Usuário criado com sucesso.", { id: toastId });
      } else if (editing) {
        await userApi.updateUser(editing.id, {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password === "" ? undefined : form.password,
        });
        toast.success("Usuário atualizado.", { id: toastId });
      }
      closeModal();
      await loadUsers(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "DUPLICATE_EMAIL") {
        setFormErrors({ email: err.message });
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar usuário.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ativar/Desativar ────────────────────────────────────────────────────────

  async function handleActivate(user: User) {
    setActionLoading(user.id);
    const toastId = toast.loading("Ativando usuário…");
    try {
      await userApi.activateUser(user.id);
      toast.success(`"${user.name}" ativado com sucesso.`, { id: toastId });
      await loadUsers(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar usuário.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeactivateConfirm() {
    if (!confirmDeactivate) return;
    const user = confirmDeactivate;
    setConfirmDeactivate(null);
    setActionLoading(user.id);
    const toastId = toast.loading("Desativando usuário…");
    try {
      await userApi.deactivateUser(user.id);
      toast.success(`"${user.name}" desativado.`, { id: toastId });
      await loadUsers(true);
    } catch (err) {
      if (err instanceof ApiRequestError && (err.code === "LAST_ACTIVE_ADMIN" || err.code === "SELF_DEACTIVATION")) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao desativar usuário.", { id: toastId });
      }
    } finally {
      setActionLoading(null);
    }
  }

  // ── Visões (Cards/Lista) ─────────────────────────────────────────────────────

  function renderActions(user: User, variant: "card" | "row") {
    const base = variant === "card" ? "flex-1 rounded-xl py-2 text-sm font-semibold" : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === user.id;
    const isSelf = user.id === currentUserId;
    return (
      <>
        <button type="button" onClick={() => openEdit(user)} disabled={busy} aria-label={`Editar usuário ${user.name}`} className={`${base} ${neutral} text-chocolate`}>
          Editar
        </button>
        {user.active ? (
          <button
            type="button"
            onClick={() => setConfirmDeactivate(user)}
            disabled={busy || isSelf}
            aria-label={isSelf ? "Você não pode desativar sua própria conta" : `Desativar usuário ${user.name}`}
            title={isSelf ? "Você não pode desativar sua própria conta" : undefined}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(user)}
            disabled={busy}
            aria-label={`Ativar usuário ${user.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
      </>
    );
  }

  const columns: EntityColumn<User>[] = [
    {
      key: "name",
      header: "Nome",
      render: (u) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-chocolate">{u.name}</span>
          <StatusBadge isActive={u.active} />
          {u.id === currentUserId && <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-muted">você</span>}
        </div>
      ),
    },
    { key: "email", header: "E-mail", className: "hidden md:table-cell", render: (u) => <span className="text-muted">{u.email}</span> },
    { key: "role", header: "Papel", className: "text-right", render: (u) => <span className="text-chocolate">{USER_ROLE_LABELS[u.role]}</span> },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Usuários" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${total} usuário${total !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
            >
              + Novo
            </button>
          </div>
        </div>

        {!error && (
          <div className="space-y-3">
            <SearchBar value={searchInput} onChange={setSearchInput} placeholder="Pesquisar por nome ou e-mail…" ariaLabel="Pesquisar usuário por nome ou e-mail" />
            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={handleStatusFilterChange}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
              ]}
            />
            <FilterChips
              label="Papel"
              selected={roleFilter}
              onSelect={handleRoleFilterChange}
              options={[{ value: "all", label: "Todos" }, ...(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => ({ value, label }))]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadUsers(false)} />}
        {!loading && !error && users.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
            description={hasActiveFilter ? "Ajuste a pesquisa ou os filtros para ver todos os usuários." : "Cadastre o primeiro usuário da equipe."}
            actionLabel={hasActiveFilter ? undefined : "+ Criar usuário"}
            onAction={hasActiveFilter ? undefined : openCreate}
          />
        )}
        {!loading && !error && users.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {users.map((user) => (
                  <EntityCard
                    key={user.id}
                    title={user.name}
                    badges={
                      <>
                        <StatusBadge isActive={user.active} />
                        {user.id === currentUserId && <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold text-muted">você</span>}
                      </>
                    }
                    actions={renderActions(user, "card")}
                  >
                    <p className="text-xs text-muted">{user.email}</p>
                    <p className="text-sm font-semibold text-chocolate">{USER_ROLE_LABELS[user.role]}</p>
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable items={users} columns={columns} getKey={(u) => u.id} renderActions={(u) => renderActions(u, "row")} />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50">
                  ‹ Anterior
                </button>
                <p className="text-xs text-muted">Página {page} de {totalPages}</p>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50">
                  Próxima ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <EntityForm
          title={modal === "create" ? "Novo usuário" : "Editar usuário"}
          submitting={submitting}
          submitLabel={modal === "create" ? "Criar" : "Salvar"}
          onClose={closeModal}
          onSubmit={handleSubmit}
        >
          <Field label="Nome" required htmlFor="user-name" error={formErrors.name}>
            <input
              id="user-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Maria Silva"
              maxLength={100}
              disabled={submitting}
            />
          </Field>

          <Field label="E-mail" required htmlFor="user-email" error={formErrors.email}>
            <input
              id="user-email"
              type="email"
              className={`input-field ${formErrors.email ? "border-rose" : ""}`}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="maria@doceatelier.com.br"
              disabled={submitting}
            />
          </Field>

          <Field label="Papel" required htmlFor="user-role">
            <select id="user-role" className="input-field" value={form.role} onChange={(e) => setField("role", e.target.value as UserRole)} disabled={submitting}>
              {(Object.entries(USER_ROLE_LABELS) as [UserRole, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field
            label={modal === "create" ? "Senha" : "Nova senha (opcional)"}
            required={modal === "create"}
            htmlFor="user-password"
            error={formErrors.password}
          >
            <input
              id="user-password"
              type="password"
              className={`input-field ${formErrors.password ? "border-rose" : ""}`}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              placeholder={modal === "create" ? "Mínimo 8 caracteres" : "Deixe em branco para não alterar"}
              disabled={submitting}
              autoComplete="new-password"
            />
          </Field>
        </EntityForm>
      )}

      {confirmDeactivate && (
        <ConfirmDialog
          title="Desativar usuário?"
          description={<><strong className="text-chocolate">{'"'}{confirmDeactivate.name}{'"'}</strong> perderá o acesso ao sistema imediatamente.</>}
          cancelLabel="Manter ativo"
          confirmLabel="Desativar"
          busy={actionLoading === confirmDeactivate.id}
          onCancel={() => setConfirmDeactivate(null)}
          onConfirm={handleDeactivateConfirm}
        />
      )}
    </PageContainer>
  );
}
