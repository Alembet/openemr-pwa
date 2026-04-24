<?php

declare(strict_types=1);

namespace OpenEMR\PWA\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

/**
 * Detects Turbo Drive / Turbo Frame / Turbo Stream requests and
 * sets attributes that controllers can use to vary their response.
 *
 * Turbo Drive   → X-Turbo-Request: true
 * Turbo Frame   → Turbo-Frame: <frame-id>
 * htmx request  → HX-Request: true
 */
final class TurboMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $headers = $request->getHeaders();

        $isTurbo      = isset($headers['x-turbo-request']);
        $turboFrameId = $headers['turbo-frame'][0] ?? null;
        $isHtmx       = isset($headers['hx-request']);
        $htmxTarget   = $headers['hx-target'][0]  ?? null;
        $htmxTrigger  = $headers['hx-trigger'][0] ?? null;

        $request = $request
            ->withAttribute('turbo',         $isTurbo)
            ->withAttribute('turbo_frame',   $turboFrameId)
            ->withAttribute('htmx',          $isHtmx)
            ->withAttribute('htmx_target',   $htmxTarget)
            ->withAttribute('htmx_trigger',  $htmxTrigger);

        $response = $handler->handle($request);

        // Tell Turbo Drive to update the browser URL after a Turbo Frame navigation
        if ($turboFrameId && $turboFrameId !== '_top') {
            $response = $response->withHeader('Vary', 'Turbo-Frame');
        }

        return $response;
    }
}
