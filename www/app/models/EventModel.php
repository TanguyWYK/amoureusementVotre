<?php


class EventModel
{
    private $_address;

    public function __construct()
    {
        $this->setAddress($_SERVER['REMOTE_ADDR']);
    }

    private function setAddress($address)
    {
        $this->_address = $address;
    }

    private function getAddress()
    {
        return $this->_address;
    }

    private function isBot()
    {

        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            return preg_match('/rambler|abacho|acoi|accona|aspseek|altavista|estyle|scrubby|lycos|geona|ia_archiver|alexa|sogou|skype|facebook|twitter|pinterest|linkedin|naver|bing|google|yahoo|duckduckgo|yandex|baidu|teoma|xing|java\/1.7.0_45|bot|crawl|slurp|spider|mediapartners|\sask\s|\saol\s/i', $_SERVER['HTTP_USER_AGENT']);
        }
        return false;
    }

    public function addEvent($name)
    {
        if (!$this->isBot()) {
            include RELATIVE_PATH['database'] . 'connection.php';
            $query = $db->prepare("INSERT INTO events(date,address,event)
					   VALUES (NOW(),?,?)");
            $query->execute([
                $this->getAddress(),
                $name
            ]);
        }
    }

    public function getLastEvents($n)
    {
        include RELATIVE_PATH['database'] . 'connection.php';
        $query = $db->prepare("SELECT * FROM events ORDER bY id DESC LIMIT " . $n);
        $query->execute();
        return $query->fetchAll();
    }

    public function getLastEventsByAddress($n, $address)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT * FROM events 
                               WHERE address = ?
                               ORDER bY id DESC LIMIT " . $n);
        $query->execute([
            $address,
        ]);
        return $query->fetchAll();
    }

    public function getUsingOfVisitor($address, $lastDays)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT event,COUNT(event) AS 'count' FROM events
                               WHERE date > NOW() - INTERVAL ? DAY AND address = ?
                               GROUP BY event");
        $query->execute([
            $lastDays,
            $address,
        ]);
        return $query->fetchAll();
    }

    public function getAddressOfVisitor($lastDays)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT address FROM events
                               WHERE date > NOW() - INTERVAL ? DAY
                               GROUP BY address");
        $query->execute([
            $lastDays
        ]);
        return $query->fetchAll();
    }

    public function cleanEventLogs($lastDays)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("DELETE FROM events
                               WHERE date < NOW() - INTERVAL ? DAY");
        $query->execute([
            $lastDays
        ]);
    }

    public function countEventLogs()
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT COUNT(id) AS 'count' FROM events
                               WHERE 1");
        $query->execute();
        return intval($query->fetch()['count']);
    }

    public function groupAddressByUserName($list)
    {
        // On regroupe toutes les adresses lorsqu'il y a un id login commun
        $listGrouped = [];
        foreach ($list as $address => $events) {
            foreach ($events as $event) {
                if (preg_match('/^login_/', $event[0])) {
                    $userId = explode('_', $event[0])[1];
                    if (array_key_exists($address, $list)) {
                        if (array_key_exists($userId, $listGrouped)) {
                            $listGrouped[$userId] = array_merge($listGrouped[$userId], $list[$address]);
                        } else {
                            $listGrouped[$userId] = $list[$address];
                        }
                        unset($list[$address]);
                    }
                }
            }
        }
        $listGrouped = $listGrouped + $list;
        // On additionne les events de même type
        foreach ($listGrouped as $address => $events) {
            $eventGrouped = [];
            foreach ($events as $event) {
                if (array_key_exists($event[0], $eventGrouped)) {
                    $eventGrouped[$event[0]] += $event[1];
                } else {
                    $eventGrouped[$event[0]] = $event[1];
                }
            }
            $listGrouped[$address] = $eventGrouped;
        }
        // On exclu les adresses n'ayant que des events de type homepage
        foreach ($listGrouped as $address => $events) {
            if (count(array_keys($events)) === 1) { // s'il n'y a qu'un type c'est nécessairement la home_page
                unset($listGrouped[$address]);
            }
        }
        return $listGrouped;
    }

    public function getAddressesByUserId($userId, $lastDays)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT address FROM events
                               WHERE date > NOW() - INTERVAL ? DAY AND event = ?
                               GROUP BY address");
        $query->execute([
            $lastDays,
            'login_' . $userId,
        ]);
        return $query->fetchAll();
    }

    public function orderEventsByDate($events)
    {
        function sortFunction($a, $b)
        {
            return strtotime($b["date"]) - strtotime($a["date"]);
        }

        usort($events, "sortFunction");
        return $events;
    }

    public function getUniqueVisitor($date_from, $date_to)
    {
        include RELATIVE_PATH['database'] . 'connectionStats.php';
        $query = $db->prepare("SELECT COUNT(DISTINCT address) AS 'visitors'
                                        FROM events 
                                        WHERE event LIKE('0%') AND date between ? AND ? AND event <> '0_homepage'");
        $query->execute([
            $date_from,
            $date_to,
        ]);
        return $query->fetch()['visitors'];
    }
}