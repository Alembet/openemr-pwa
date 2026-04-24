<?php

declare(strict_types=1);

namespace OpenEMR\PWA\Controllers;

use OpenEMR\Services\PatientService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Twig\Environment;

/**
 * Patient list & detail — demonstrates how to respond to
 * Turbo Drive, Turbo Frame, htmx and Turbo Stream requests
 * from the same controller method.
 */
final class PatientController
{
    public function __construct(
        private readonly PatientService $patients,
        private readonly Environment    $twig,
    ) {}

    // GET /patients
    public function index(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $params = $request->getQueryParams();
        $page   = max(1, (int) ($params['page'] ?? 1));
        $q      = trim($params['q'] ?? '');

        $result     = $this->patients->search($q, perPage: 25, page: $page);
        $isTurbo    = $request->getAttribute('turbo');
        $frameId    = $request->getAttribute('turbo_frame');
        $isHtmx     = $request->getAttribute('htmx');

        // Turbo Frame request: render only the frame content
        if ($frameId === 'patients-table' || $isHtmx) {
            $html = $this->twig->render('patients/_table.html.twig', $result);
        } else {
            $html = $this->twig->render('patients/index.html.twig', $result);
        }

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }

    // GET /patients/{pid}
    public function show(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $patient = $this->patients->getPatientData($args['pid']);
        $html    = $this->twig->render('patients/show.html.twig', compact('patient'));

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }

    // POST /patients  →  returns a Turbo Stream that prepends the new row
    public function store(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $data   = (array) $request->getParsedBody();
        $pid    = $this->patients->insert($data);
        $patient = $this->patients->getPatientData($pid);

        // Turbo Stream: prepend new row + clear the form frame
        $stream = $this->twig->render('patients/_stream_create.html.twig', compact('patient'));

        $response->getBody()->write($stream);
        return $response
            ->withStatus(200)
            ->withHeader('Content-Type', 'text/vnd.turbo-stream.html; charset=utf-8');
    }

    // DELETE /patients/{pid}  →  htmx: return empty 200 so htmx removes the row
    public function destroy(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $this->patients->delete($args['pid']);
        // Empty body → htmx swaps outerHTML of the row with nothing (removes it)
        return $response->withStatus(200);
    }

    // GET /patients/{pid}/edit-row  →  htmx inline edit
    public function editRow(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $patient = $this->patients->getPatientData($args['pid']);
        $html    = $this->twig->render('patients/_edit_row.html.twig', compact('patient'));

        $response->getBody()->write($html);
        return $response->withHeader('Content-Type', 'text/html; charset=utf-8');
    }

    // GET /api/patients/search  →  JSON autocomplete
    public function apiSearch(ServerRequestInterface $request, ResponseInterface $response): ResponseInterface
    {
        $q      = trim($request->getQueryParams()['q'] ?? '');
        $result = $this->patients->search($q, perPage: 10, page: 1);

        $items = array_map(fn($p) => [
            'value' => $p['pid'],
            'label' => "{$p['lname']}, {$p['fname']}",
            'meta'  => $p['dob'],
        ], $result['patients']);

        $response->getBody()->write(json_encode($items, JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json');
    }
}
