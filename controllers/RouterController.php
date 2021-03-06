<?php
class RouterController extends Controller
{
    protected $controller;

    public function parse($params)
    {
        $parsedU = $this->parseURL($params[0]);
        $this->header['page_keywords'] = "SPSE Gaming, SPSE Esport, SPSE Gaming Events, SPSE Esport Events, SPŠE Esport, SPŠE Gaming, SPŠE Gaming Events, SPŠE Esport Events,";
        if (empty($parsedU[0])) {
            $this->redir('home');
        }

        $controllerClass = $this->toCamelCase(array_shift($parsedU)) . 'Controller';
        if (file_exists('controllers/' . $controllerClass . '.php')) {
            $this->controller = new $controllerClass;
        } else {
            $this->redir('status/404');
        }

        $this->controller->parse($parsedU);

        if ($this->checkLogged()) {
            $this->data['usrname'] = $_SESSION['user']['name'];
        }
        $this->checkAdmin();
        $this->data['title'] = $this->controller->header['page_title'];
        $this->data['desc'] = $this->controller->header['page_desc'];
        $this->data['keywords'] = $this->controller->header['page_keywords'];
        $this->data['messages'] = $this->returnMessages();
        $this->data['logged'] = $_SESSION['logged'];
        if (isset($_SESSION['user'])) {
            $this->data['user'] = $_SESSION['user'];
        }
        $this->header['page_title'] = "SPSE Gaming Hub.";
        if (substr($params[0], 0, 4) == "/api") {
            $this->view = $this->controller->showView();
        } else {
            $this->view = "layout";
        }
    }

    private function parseURL($url)
    {
        $prsU = parse_url($url);
        $prsU['path'] = trim(ltrim($prsU['path'], "/"));
        $divPath = explode("/", $prsU['path']);
        return $divPath;
    }

    private function toCamelCase($txt)
    {
        $sent = str_replace('-', ' ', $txt);
        $sent = ucwords($sent);
        $sent = str_replace(' ', '', $sent);
        return $sent;
    }
}
