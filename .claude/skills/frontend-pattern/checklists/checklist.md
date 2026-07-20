# Checklist — página admin pronta

Parte da Skill `frontend-pattern`. Carregar apenas ao finalizar uma página admin CRUD, antes de declará-la pronta.

- [ ] Os 12 estados de `useState` da seção 4.2 presentes.
- [ ] `loadX(silent)` implementado com o padrão silent/não-silent (4.3).
- [ ] `LoadingState`, `EmptyState`, `ErrorState` implementados.
- [ ] Toast com auto-dismiss em 3500ms, exceto `"loading"` (4.5).
- [ ] Modal de criar/editar com componente `Field` reutilizável (4.6).
- [ ] `ConfirmModal` antes de qualquer desativação; ativação sem confirmação (4.7).
- [ ] `ValidationSummary` compartilhado — nunca reimplementado (4.8).
- [ ] `validateForm()` local espelhando o Validator do backend (4.9).
- [ ] `applyServerValidationErrors` tratando erro 400 (4.9).
- [ ] Campos somente-leitura nunca enviados no PATCH (4.9).
- [ ] Nenhuma chamada a Service/Repository/Prisma — só o cliente HTTP do próprio domínio (4.1).
- [ ] Texto do `ConfirmModal` reflete o comportamento real do Service — não copiado genericamente de outro módulo (4.7).

---

Precedência: em caso de conflito com `SKILL.md`, este arquivo é apenas a versão em lista de verificação — o `SKILL.md` é a fonte de verdade.
