<!--
  AIChat — Chat interface for AI Assistant (Manager-only).
  MVP: echoes user message with "AI belum tersedia" placeholder.
-->
<script lang="ts">
  import { formatTime } from '$lib/utils/format';

  export interface AIMessage {
    id: number | string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
  }

  export interface AIConversation {
    id: number | string;
    title?: string;
    messages: AIMessage[];
  }

  let { conversation, activity = [], insights = [] as string[], onSubmit = (_prompt: string) => {}, onNewConversation = () => {} }: {
    conversation: AIConversation;
    activity?: AIMessage[];
    insights?: string[];
    onSubmit?: (prompt: string) => void;
    onNewConversation?: () => void;
  } = $props();

  let prompt = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
    prompt = '';
  }

  function applyInsight(text: string) {
    prompt = text;
  }
</script>

<div class="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
  <!-- Header -->
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="text-2xl">🤖</span>
      <div>
        <h3 class="font-semibold text-gray-800">HEKAS AI</h3>
        <div class="text-xs text-gray-500">{conversation.title || 'Percakapan baru'}</div>
      </div>
    </div>
    <button
      type="button"
      class="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
      onclick={onNewConversation}
    >
      + Baru
    </button>
  </div>

  <!-- Messages -->
  <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
    {#if conversation.messages.length === 0}
      <div class="text-center text-sm text-gray-400 py-8">
        <div class="text-4xl mb-2">💬</div>
        <div>Mulai percakapan dengan menanyakan apa saja</div>
      </div>
    {:else}
      {#each conversation.messages as msg}
        <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[75%] rounded-lg px-3 py-2 {msg.role === 'user' ? 'bg-blue-600 text-white' : msg.role === 'system' ? 'bg-gray-100 text-gray-600 italic text-xs' : 'bg-gray-100 text-gray-800'}">
            <div class="text-sm whitespace-pre-wrap">{msg.content}</div>
            {#if msg.role !== 'system'}
              <div class="text-xs {msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'} mt-1">
                {formatTime(msg.created_at)}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Insights chips (quick prompts) -->
  {#if insights.length > 0}
    <div class="px-4 py-2 border-t border-gray-100 bg-gray-50">
      <div class="text-xs text-gray-500 mb-1">💡 Insight cepat:</div>
      <div class="flex flex-wrap gap-1">
        {#each insights as insight}
          <button
            type="button"
            class="px-2 py-1 bg-white border border-gray-300 rounded-full text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
            onclick={() => applyInsight(insight)}
          >
            {insight}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Input -->
  <form onsubmit={handleSubmit} class="px-4 py-3 border-t border-gray-200 flex gap-2">
    <textarea
      bind:value={prompt}
      placeholder="Tanyakan tentang penjualan, stok, karyawan…"
      rows="2"
      class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      onkeydown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          handleSubmit(e);
        }
      }}
    ></textarea>
    <button
      type="submit"
      class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
      disabled={prompt.trim().length === 0}
    >
      Kirim
    </button>
  </form>
</div>

{#if activity.length > 0}
  <div class="mt-3 bg-white rounded-lg border border-gray-200 p-3">
    <div class="text-xs font-semibold text-gray-600 mb-2">Aktivitas Terbaru</div>
    <ul class="space-y-1">
      {#each activity.slice(0, 5) as msg}
        <li class="text-xs text-gray-600 truncate">• {msg.content}</li>
      {/each}
    </ul>
  </div>
{/if}