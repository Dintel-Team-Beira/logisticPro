<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Logitsic Pro | Sistema de Gestão Logística') }}</title>

    <meta name="author" content="Eng. Arnaldo Tomo">
  <meta name="description" content="Logistic Pro — Sistema inteligente de gestão logística para importação e exportação. Controle, rastreie e otimize operações portuárias e fronteiriças com eficiência.">
  <meta name="keywords" content="Logística, Importação, Exportação, Transporte, Rastreamento, Cargas, Portos, Fronteiras, Moçambique, Logistic Pro">
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="{{ asset('logo.svg') }}">
  <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('logo.svg') }}">
  <link rel="shortcut icon" href="{{ asset('logo.svg') }}">

  <!-- Open Graph (para redes sociais) -->
  <meta property="og:title" content="Logistic Pro | Sistema de Gestão Logística">
  <meta property="og:description" content="Simplifique o processo de importação e exportação com o Logistic Pro. Controle e rastreie cargas em tempo real.">
  <meta property="og:image" content="{{ asset('logo.svg') }}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{ url('/') }}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Logistic Pro | Gestão de Importação e Exportação">
  <meta name="twitter:description" content="A solução logística que conecta fronteiras, portos e eficiência.">
  <meta name="twitter:image" content="{{ asset('logo.svg') }}">

  <!-- Tema e SEO -->
  <meta name="theme-color" content="#004080">
  <meta name="robots" content="index, follow">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />


        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        <script src="resources/js/app.jsx"></script>
        @inertiaHead
    </head>
    <body style="zoom: 90%" class="font-sans popins bg-[url('/background.min.svg')] bg-cover bg-center bg-fixed bg-no-repeat">

        @inertia
    </body >
</html>
