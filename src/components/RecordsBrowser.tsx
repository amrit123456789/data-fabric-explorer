import { useEffect, useMemo, useState } from 'react';
import { Entities } from '@uipath/uipath-typescript/entities';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type EntitySummary = { Id?: string; id?: string; Name?: string; name?: string; DisplayName?: string };
type RecordRow = Record<string, unknown>;

function pick<T = string>(obj: any, ...keys: string[]): T | undefined {
  for (const k of keys) if (obj?.[k] != null) return obj[k];
  return undefined;
}

export function RecordsBrowser() {
  const { sdk, logout } = useAuth();
  const entities = useMemo(() => new Entities(sdk), [sdk]);

  const [entityList, setEntityList] = useState<EntitySummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page: any = await entities.getAll();
        const list: any[] = Array.isArray(page) ? page : (page?.items ?? page?.value ?? []);
        setEntityList(list);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load entities');
      } finally {
        setLoading(false);
      }
    })();
  }, [entities]);

  const loadRecords = async (id: string, nextCursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const page: any = await entities.getAllRecords(id, { pageSize: 50, ...(nextCursor ? { cursor: nextCursor } : {}) } as any);
      const items: any[] = Array.isArray(page) ? page : (page?.items ?? page?.value ?? page?.data ?? []);
      setRecords(nextCursor ? [...records, ...items] : items);
      setHasNext(Boolean(page?.hasNextPage));
      setCursor(page?.nextCursor);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const onPick = (id: string) => {
    setSelectedId(id);
    setRecords([]);
    setCursor(undefined);
    setHasNext(false);
    loadRecords(id);
  };

  const columns = useMemo(() => {
    const set = new Set<string>();
    records.slice(0, 25).forEach((r) => Object.keys(r ?? {}).forEach((k) => set.add(k)));
    const cols = Array.from(set);
    // Put Id first if present
    cols.sort((a, b) => (a === 'Id' ? -1 : b === 'Id' ? 1 : 0));
    return cols.slice(0, 10);
  }, [records]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Data Fabric Records</h1>
            <p className="text-xs text-muted-foreground">Browse entities and records from your UiPath tenant</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <section className="flex flex-wrap items-end gap-3">
          <div className="min-w-[280px] flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Entity</label>
            <Select value={selectedId} onValueChange={onPick}>
              <SelectTrigger>
                <SelectValue placeholder={entityList.length ? 'Select an entity' : 'Loading entities…'} />
              </SelectTrigger>
              <SelectContent>
                {entityList.map((e) => {
                  const id = pick<string>(e, 'Id', 'id')!;
                  const name = pick<string>(e, 'DisplayName', 'Name', 'name') ?? id;
                  return (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {selectedId && (
            <Button variant="secondary" onClick={() => loadRecords(selectedId)} disabled={loading}>
              Refresh
            </Button>
          )}
        </section>

        {error && (
          <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="rounded-lg border border-border">
          {!selectedId ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Choose an entity to view its records.
            </div>
          ) : records.length === 0 && !loading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">No records.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r, i) => (
                  <TableRow key={(r as any).Id ?? (r as any).id ?? i}>
                    {columns.map((c) => (
                      <TableCell key={c} className="max-w-[220px] truncate font-mono text-xs">
                        {formatCell((r as any)[c])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{records.length} record{records.length === 1 ? '' : 's'} loaded</span>
          {hasNext && selectedId && (
            <Button size="sm" variant="outline" disabled={loading} onClick={() => loadRecords(selectedId, cursor)}>
              Load more
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}