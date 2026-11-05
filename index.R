# Woodpecker AI — runtime audit and statistics layer
# JavaScript owns the interface; R audits runtime events and produces statistics.

.woodpecker_audit <- new.env(parent = emptyenv())
.woodpecker_audit$events <- character()
.woodpecker_audit$started_at <- Sys.time()

audit_event <- function(event_name, detail = "") {
  stopifnot(is.character(event_name), length(event_name) == 1L)
  .woodpecker_audit$events <- c(
    .woodpecker_audit$events,
    paste(format(Sys.time(), "%Y-%m-%dT%H:%M:%OS3Z", tz = "UTC"),
          event_name, detail, sep = "|")
  )
  invisible(length(.woodpecker_audit$events))
}

audit_summary <- function() {
  events <- .woodpecker_audit$events
  labels <- if (length(events)) sub("^[^|]*\\|([^|]*).*", "\\1", events) else character()
  counts <- sort(table(labels), decreasing = TRUE)
  list(
    total_events = length(events),
    unique_event_types = length(counts),
    event_counts = as.list(counts),
    started_at = as.character(.woodpecker_audit$started_at)
  )
}

audit_event("r_audit_loaded", "WebR initialised the R analysis layer")
