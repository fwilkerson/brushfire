CREATE SEQUENCE public.event_event_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
ALTER TABLE public.event_event_id_seq
  OWNER TO "FWilkerson";

CREATE TABLE public.event
(
  event_id integer NOT NULL DEFAULT nextval('event_event_id_seq'::regclass),
  type text NOT NULL,
  aggregate_id uuid NOT NULL,
  payload json,
  created_at timestamp with time zone DEFAULT now()
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.event
  OWNER TO "FWilkerson";